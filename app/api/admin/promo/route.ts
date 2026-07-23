import { NextRequest } from "next/server";
import { requireOwner } from "@/lib/admin-guard";
import { createPromoCode, listPromoCodes } from "@/lib/entitlement-server";
import { listOwnerPasskeys, consumeMintToken } from "@/lib/passkey-server";
import { TIER_RANK, type Tier } from "@/lib/entitlement";

export const runtime = "nodejs";

// List every minted code (owner only).
export async function GET(req: NextRequest) {
  const gate = await requireOwner(req);
  if (!gate.ok) return gate.response;
  try {
    return Response.json({ codes: await listPromoCodes() });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Failed to load." }, { status: 500 });
  }
}

// Mint a code (owner only). Once a passkey is registered, minting also requires
// a fresh passkey step-up (a single-use mintToken from /passkey/auth-verify) —
// so a stolen session alone can't grant free access. Before the first passkey
// exists, the owner login bootstraps minting (and the UI nudges to set one up).
export async function POST(req: NextRequest) {
  const gate = await requireOwner(req);
  if (!gate.ok) return gate.response;

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  const passkeys = await listOwnerPasskeys(gate.uid);
  if (passkeys.length > 0) {
    const ok = await consumeMintToken(gate.uid, b.mintToken);
    if (!ok)
      return Response.json({ error: "Confirm with your passkey to mint.", needsPasskey: true }, { status: 401 });
  }

  const tier = b.tier as Tier;
  if (!tier || !(tier in TIER_RANK)) return Response.json({ error: "Pick a tier." }, { status: 400 });
  const durationDays = Math.max(1, Math.floor(Number(b.durationDays) || 30));
  const maxUses = Math.max(1, Math.floor(Number(b.maxUses) || 1));
  const codeExpiresAt =
    typeof b.codeExpiresAt === "number" && b.codeExpiresAt > 0 ? b.codeExpiresAt : null;
  const recipientEmail =
    typeof b.recipientEmail === "string" && b.recipientEmail.trim() ? b.recipientEmail.trim() : null;
  const note = typeof b.note === "string" ? b.note.slice(0, 200) : "";

  try {
    const doc = await createPromoCode({
      tier, durationDays, codeExpiresAt, maxUses, recipientEmail, note,
      createdByEmail: gate.email, now: Date.now(),
    });
    return Response.json({ ok: true, code: doc });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Failed to mint." }, { status: 500 });
  }
}
