import { NextRequest } from "next/server";
import { getAuth } from "@/lib/api-helpers";
import { redeemPromoCode } from "@/lib/entitlement-server";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// A code is worth free access, so the one thing this endpoint must not be is a
// free guessing machine. Codes are long enough that guessing is hopeless
// anyway; this makes sure nobody gets to try at speed.
const REDEEM_LIMIT = 10;
const REDEEM_WINDOW_MS = 10 * 60_000;

export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return Response.json({ error: "Not signed in." }, { status: 401 });
  let body: { code?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  if (typeof body.code !== "string" || !body.code.trim())
    return Response.json({ error: "Enter a code." }, { status: 400 });

  const rl = checkRateLimit(`redeem:${auth.uid}`, REDEEM_LIMIT, REDEEM_WINDOW_MS);
  if (!rl.ok) {
    const seconds = Math.ceil(rl.retryAfterMs / 1000);
    return Response.json(
      { error: `That's a lot of codes. Try again in ${Math.ceil(seconds / 60)} minute${seconds > 60 ? "s" : ""}.` },
      { status: 429, headers: { "Retry-After": String(seconds) } }
    );
  }

  const result = await redeemPromoCode(auth.uid, auth.email, body.code, Date.now());
  if (!result.ok) return Response.json({ error: result.reason }, { status: 400 });
  return Response.json({ ok: true, tier: result.tier, expiresAt: result.expiresAt });
}
