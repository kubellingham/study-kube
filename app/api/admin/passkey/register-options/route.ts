import { NextRequest } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { requireOwner } from "@/lib/admin-guard";
import { rpFromReq, RP_NAME, saveChallenge, listOwnerPasskeys } from "@/lib/passkey-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const gate = await requireOwner(req);
  if (!gate.ok) return gate.response;
  const { rpID } = rpFromReq(req);
  const existing = await listOwnerPasskeys(gate.uid);
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID,
    userID: new TextEncoder().encode(gate.uid),
    userName: gate.email,
    attestationType: "none",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    excludeCredentials: existing.map((p) => ({ id: p.id, transports: p.transports as any })),
    authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
  });
  await saveChallenge(gate.uid, options.challenge);
  return Response.json(options);
}
