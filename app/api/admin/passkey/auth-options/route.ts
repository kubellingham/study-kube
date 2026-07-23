import { NextRequest } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { requireOwner } from "@/lib/admin-guard";
import { rpFromReq, saveChallenge, listOwnerPasskeys } from "@/lib/passkey-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const gate = await requireOwner(req);
  if (!gate.ok) return gate.response;
  const { rpID } = rpFromReq(req);
  const passkeys = await listOwnerPasskeys(gate.uid);
  if (!passkeys.length) return Response.json({ error: "No passkey registered yet." }, { status: 400 });
  const options = await generateAuthenticationOptions({
    rpID,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allowCredentials: passkeys.map((p) => ({ id: p.id, transports: p.transports as any })),
    userVerification: "preferred",
  });
  await saveChallenge(gate.uid, options.challenge);
  return Response.json(options);
}
