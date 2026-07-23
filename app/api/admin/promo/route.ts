import { NextRequest } from "next/server";
import { getAuth } from "@/lib/api-helpers";
import { isOwner } from "@/lib/owner";
import { createPromoCode, listPromoCodes } from "@/lib/entitlement-server";
import { TIER_RANK, type Tier } from "@/lib/entitlement";

export const runtime = "nodejs";

async function requireOwner(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return { ok: false as const, response: Response.json({ error: "Not signed in." }, { status: 401 }) };
  if (!isOwner(auth.email)) return { ok: false as const, response: Response.json({ error: "Not authorized." }, { status: 403 }) };
  return { ok: true as const, email: auth.email! };
}

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

// Mint a code (owner only). NOTE: a passkey step-up guards this action in a
// follow-up slice; today it is gated to the owner login.
export async function POST(req: NextRequest) {
  const gate = await requireOwner(req);
  if (!gate.ok) return gate.response;
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
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
