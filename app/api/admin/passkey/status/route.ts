import { NextRequest } from "next/server";
import { requireOwner } from "@/lib/admin-guard";
import { listOwnerPasskeys } from "@/lib/passkey-server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const gate = await requireOwner(req);
  if (!gate.ok) return gate.response;
  const passkeys = await listOwnerPasskeys(gate.uid);
  return Response.json({ registered: passkeys.length > 0, count: passkeys.length });
}
