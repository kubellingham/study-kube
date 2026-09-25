// Server-side access resolution + promo-code machinery. All reads/writes here
// go through the Admin SDK (bypasses client rules), so entitlement can never be
// forged from the browser — the client copy is UX only; this is the real gate.
import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getAuth } from "@/lib/api-helpers";
import {
  freeTopicsLeft,
  mayClimb,
  meetsTier,
  resolveEntitlement,
  FREE_TOPIC_ALLOWANCE,
  TIER_LABEL,
  type Entitlement,
  type Grant,
  type Tier,
} from "@/lib/entitlement";

/** The free allowance can be switched off instantly — one environment
 *  variable, no deploy of code. If a hundred signups ever start draining the
 *  model budget overnight, this is the handle to pull first and think second. */
export const freeBuildsOn = () => process.env.FREE_BUILD !== "0";

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

/** Gate STUDYING what's already built — lessons, practice, notes, the helpers
 *  inside a lesson. A plan, or a free account, which keeps what its allowance
 *  built for good. (Building more is a separate gate, below.) */
export async function requireStudyAccess(
  req: NextRequest
): Promise<{ ok: true; uid: string; email: string | null } | { ok: false; response: Response }> {
  const auth = await getAuth(req);
  if (!auth)
    return { ok: false, response: Response.json({ error: "Not signed in." }, { status: 401 }) };
  const ent = await getEntitlement(auth.uid);
  if (meetsTier(ent, "climb") || mayClimb(ent))
    return { ok: true, uid: auth.uid, email: auth.email };
  return {
    ok: false,
    response: Response.json(
      { error: `This needs ${TIER_LABEL.climb}.`, needsTier: "climb" as Tier },
      { status: 402 }
    ),
  };
}

/** Gate the BUILD path (digesting material). Unlike every other paid route
 *  this one has two ways in: a plan, or a free account with allowance left.
 *  Returns `topicCap` — the number of topics this build may produce, or null
 *  when there's no cap at all. */
export async function requireBuildAccess(
  req: NextRequest
): Promise<
  | { ok: true; uid: string; email: string | null; topicCap: number | null }
  | { ok: false; response: Response }
> {
  const auth = await getAuth(req);
  if (!auth)
    return { ok: false, response: Response.json({ error: "Not signed in." }, { status: 401 }) };
  const ent = await getEntitlement(auth.uid);
  if (meetsTier(ent, "climb"))
    return { ok: true, uid: auth.uid, email: auth.email, topicCap: null };

  const left = freeBuildsOn() ? freeTopicsLeft(ent) : 0;
  if (left > 0) return { ok: true, uid: auth.uid, email: auth.email, topicCap: left };

  return {
    ok: false,
    response: Response.json(
      {
        error: ent.free?.eligible
          ? `You've used all ${ent.free.allowance} of your free topics — everything you've built stays yours. Pick a plan to keep building.`
          : "Building a subject needs a plan.",
        needsTier: "climb" as Tier,
      },
      { status: 402 }
    ),
  };
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
  // While a subscription's status is "active", access never lapses on the
  // period end — Stripe flips the status (via webhook) on cancel/past_due, so a
  // slow renewal webhook can't lock out a paying subscriber. (expiresAt is
  // null; the period end is only for display, read separately if needed.)
  //
  // An account may hold several subscriptions at once (Climb bought outright
  // alongside Summit, a crew leader who also subscribes for themselves), so
  // each one is a grant of its own and the best active one wins below. Accounts
  // written before that are read from the flat fields exactly as before.
  const subs = d.stripeSubs as
    | Record<string, { tier?: Tier | null; status?: string } | null>
    | undefined;
  if (subs && Object.keys(subs).length > 0) {
    for (const sub of Object.values(subs)) {
      if (sub?.tier && sub.status === "active")
        grants.push({ tier: sub.tier, source: "stripe", expiresAt: null });
    }
  } else if (d.stripeTier && d.stripeStatus === "active") {
    grants.push({ tier: d.stripeTier as Tier, source: "stripe", expiresAt: null });
  }
  if (d.crewTier)
    grants.push({ tier: d.crewTier as Tier, source: "crew", expiresAt: d.crewExpiresAt ?? null });
  const ent = resolveEntitlement(grants, now);
  if (ent.tier) return ent;

  // No active plan. Either this account has never paid — in which case it gets
  // the free allowance — or it had one and it lapsed, in which case it doesn't:
  // otherwise you could subscribe, build a whole semester, cancel, and keep it.
  const everPaid =
    !!d.promoTier ||
    !!d.crewTier ||
    !!d.stripeTier ||
    Object.keys((d.stripeSubs ?? {}) as Record<string, unknown>).length > 0;
  // Eligibility is about never having paid — deliberately NOT about the kill
  // switch. Turning free builds off must stop NEW builds, never take away what
  // someone already built; that's the build gate's job, below.
  return {
    ...ent,
    free: {
      used: typeof d.freeTopicsUsed === "number" ? d.freeTopicsUsed : 0,
      allowance: FREE_TOPIC_ALLOWANCE,
      eligible: !everPaid,
    },
  };
}

/** Count topics against the free allowance. Called only after a build has
 *  actually produced them — a digest that failed, or ran out of time before
 *  teaching anything, costs the student nothing. */
export async function spendFreeTopics(uid: string, topics: number): Promise<void> {
  if (topics <= 0) return;
  const ref = adminDb().collection("entitlements").doc(uid);
  await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const used = (snap.data()?.freeTopicsUsed as number | undefined) ?? 0;
    tx.set(ref, { freeTopicsUsed: used + topics }, { merge: true });
  });
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
