import { NextRequest } from "next/server";
import { getAuth } from "@/lib/api-helpers";
import { redeemPromoCode } from "@/lib/entitlement-server";

export const runtime = "nodejs";

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

  const result = await redeemPromoCode(auth.uid, auth.email, body.code, Date.now());
  if (!result.ok) return Response.json({ error: result.reason }, { status: 400 });
  return Response.json({ ok: true, tier: result.tier, expiresAt: result.expiresAt });
}
