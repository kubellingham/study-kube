import type { NextRequest } from "next/server";
import { getAuth } from "@/lib/api-helpers";
import { isOwner } from "@/lib/owner";

// Server-only owner gate for the back office (mint, passkey ceremonies).
export async function requireOwner(
  req: NextRequest
): Promise<{ ok: true; uid: string; email: string } | { ok: false; response: Response }> {
  const auth = await getAuth(req);
  if (!auth)
    return { ok: false, response: Response.json({ error: "Not signed in." }, { status: 401 }) };
  if (!isOwner(auth.email))
    return { ok: false, response: Response.json({ error: "Not authorized." }, { status: 403 }) };
  return { ok: true, uid: auth.uid, email: auth.email! };
}
