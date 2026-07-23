// Server-side access resolution + promo-code machinery. All reads/writes here
// go through the Admin SDK (bypasses client rules), so entitlement can never be
// forged from the browser — the client copy is UX only; this is the real gate.
import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getAuth } from "@/lib/api-helpers";
import {
  meetsTier,
  resolveEntitlement,
  TIER_LABEL,
  type Entitlement,
  type Grant,
  type Tier,
} from "@/lib/entitlement";

// ── Route guard ──────────────────────────────────────────────────────────

/** Gate an API route on a minimum tier. 402 (Payment Required) with the tier
 *  the caller needs, so the client can surface the right warm upsell. */
export async function requireEntitlement(
  req: NextRequest,
  min: Tier
): Promise<{ ok: true; uid: string; email: string | null } | { ok: false; response: Response }> {
  const auth = await getAuth(req);
  if (!auth)
    return { ok: false, response: Response.json({ error: "Not signed in." }, { status: 401 }) };
  const ent = await getEntitlement(auth.uid);
  if (!meetsTier(ent, min)) {
    return {
      ok: false,
      response: Response.json(
        { error: `This needs ${TIER_LABEL[min]}.`, needsTier: min },
        { status: 402 }
      ),
    };
  }
  return { ok: true, uid: auth.uid, email: auth.email };
}

// ── Access resolution ────────────────────────────────────────────────────

/** The user's stored grants live on entitlements/{uid}. Stripe + crew fields
 *  are written by their own flows later; promo fields by redeem below. */
export async function getEntitlement(uid: string): Promise<Entitlement> {
  const snap = await adminDb().collection("entitlements").doc(uid).get();
  const now = Date.now();
  if (!snap.exists) return resolveEntitlement([], now);
  const d = snap.data() || {};
  const grants: Grant[] = [];
  if (d.promoTier)
    grants.push({ tier: d.promoTier as Tier, source: "promo", expiresAt: d.promoExpiresAt ?? null });
  if (d.stripeTier && d.stripeStatus === "active")
    // While the subscription's status is "active", access never lapses on the
    // period end — Stripe flips the status (via webhook) on cancel/past_due, so
    // a slow renewal webhook can't lock out a paying subscriber. (expiresAt is
    // null; the period end is only for display, read separately if needed.)
    grants.push({ tier: d.stripeTier as Tier, source: "stripe", expiresAt: null });
  if (d.crewTier)
    grants.push({ tier: d.crewTier as Tier, source: "crew", expiresAt: d.crewExpiresAt ?? null });
  return resolveEntitlement(grants, now);
}

// ── Promo codes ──────────────────────────────────────────────────────────

// 16 chars, uppercase letters + digits. Ambiguous 0/O and 1/I are dropped so a
// hand-typed code is unmistakable — still "capitals and numbers", just legible.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LEN = 16;

export function generateCode(): string {
  const { randomInt } = require("crypto") as typeof import("crypto");
  let out = "";
  for (let i = 0; i < CODE_LEN; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

export interface PromoCodeDoc {
  code: string;
  tier: Tier;
  durationDays: number; // access length granted on redemption
  codeExpiresAt: number | null; // hard expiry of the code itself
  maxUses: number;
  uses: number;
  recipientEmail: string | null;
  note: string;
  active: boolean;
  createdAt: number;
  createdByEmail: string;
}

export async function createPromoCode(input: {
  tier: Tier;
  durationDays: number;
  codeExpiresAt: number | null;
  maxUses: number;
  recipientEmail: string | null;
  note: string;
  createdByEmail: string;
  now: number;
}): Promise<PromoCodeDoc> {
  const db = adminDb();
  // Retry on the (astronomically unlikely) collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const ref = db.collection("promoCodes").doc(code);
    const existing = await ref.get();
    if (existing.exists) continue;
    const doc: PromoCodeDoc = {
      code,
      tier: input.tier,
      durationDays: input.durationDays,
      codeExpiresAt: input.codeExpiresAt,
      maxUses: input.maxUses,
      uses: 0,
      recipientEmail: input.recipientEmail,
      note: input.note,
      active: true,
      createdAt: input.now,
      createdByEmail: input.createdByEmail,
    };
    await ref.set(doc);
    return doc;
  }
  throw new Error("Could not generate a unique code — try again.");
}

export type RedeemResult =
  | { ok: true; tier: Tier; expiresAt: number }
  | { ok: false; reason: string };

/** Redeem a code for a user: validates + records atomically, then grants the
 *  tier on entitlements/{uid} until now + durationDays. */
export async function redeemPromoCode(
  uid: string,
  email: string | null,
  rawCode: string,
  now: number
): Promise<RedeemResult> {
  const code = rawCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (code.length !== CODE_LEN) return { ok: false, reason: "That code doesn't look right." };
  const db = adminDb();
  const codeRef = db.collection("promoCodes").doc(code);
  const entRef = db.collection("entitlements").doc(uid);

  try {
    const grant = await db.runTransaction(async (tx) => {
      const snap = await tx.get(codeRef);
      if (!snap.exists) throw new Error("We couldn't find that code.");
      const c = snap.data() as PromoCodeDoc;
      if (!c.active) throw new Error("That code has been turned off.");
      if (c.codeExpiresAt != null && now > c.codeExpiresAt) throw new Error("That code has expired.");
      if (c.uses >= c.maxUses) throw new Error("That code has already been used up.");
      const expiresAt = now + c.durationDays * 86_400_000;
      tx.update(codeRef, { uses: c.uses + 1 });
      tx.set(
        entRef,
        { promoTier: c.tier, promoExpiresAt: expiresAt, promoCode: code, promoRedeemedAt: now },
        { merge: true }
      );
      tx.set(db.collection("redemptions").doc(), {
        code, uid, email: email ?? null, tier: c.tier, redeemedAt: now, expiresAt,
      });
      return { tier: c.tier, expiresAt };
    });
    return { ok: true, tier: grant.tier, expiresAt: grant.expiresAt };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "Could not redeem that code." };
  }
}

export async function listPromoCodes(limit = 200): Promise<PromoCodeDoc[]> {
  const snap = await adminDb()
    .collection("promoCodes")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((d) => d.data() as PromoCodeDoc);
}
