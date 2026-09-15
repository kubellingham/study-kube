import { NextRequest } from "next/server";
import { getAuth } from "@/lib/api-helpers";
import { ensureUserDoc } from "@/lib/referral";

export const runtime = "nodejs";

/** Called by the client on every first successful sign-in. Idempotent —
 *  creating a user doc, generating the referral code, applying a `ref`
 *  captured on the landing page, and backfilling identity are all safe to
 *  repeat. */
export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { ref?: unknown; displayName?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    // Empty body is fine — first sign-in with no referral.
  }

  const ref = typeof body.ref === "string" ? body.ref : null;
  const displayName =
    typeof body.displayName === "string" && body.displayName.trim().length > 0
      ? body.displayName.trim().slice(0, 120)
      : null;
  const doc = await ensureUserDoc(auth.uid, ref, {
    email: auth.email,
    displayName,
  });
  return Response.json({ user: doc });
}
