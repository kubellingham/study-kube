import { NextRequest } from "next/server";
import { getUid } from "@/lib/api-helpers";
import { getEntitlement } from "@/lib/entitlement-server";
import { LOCKED } from "@/lib/entitlement";

export const runtime = "nodejs";

// The signed-in user's effective access. UX only — every paid action is
// re-checked server-side at its own route.
export async function GET(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid) return Response.json(LOCKED);
  try {
    return Response.json(await getEntitlement(uid));
  } catch {
    return Response.json(LOCKED);
  }
}
