import { NextRequest } from "next/server";
import { getAuth } from "@/lib/api-helpers";
import { allowanceStatus } from "@/lib/spend";
import { getEntitlement } from "@/lib/entitlement-server";
import { LOCKED } from "@/lib/entitlement";

export const runtime = "nodejs";

// The signed-in user's effective access. UX only — every paid action is
// re-checked server-side at its own route.
export async function GET(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return Response.json(LOCKED);
  try {
    const ent = await getEntitlement(auth.uid);
    const allowance = await allowanceStatus(auth.uid, auth.email, ent);
    return Response.json(allowance ? { ...ent, allowance } : ent);
  } catch {
    return Response.json(LOCKED);
  }
}
