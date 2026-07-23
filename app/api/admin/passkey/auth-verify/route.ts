import { NextRequest } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { requireOwner } from "@/lib/admin-guard";
import { rpFromReq, takeChallenge, listOwnerPasskeys, updatePasskeyCounter, bytesFromB64u, issueMintToken } from "@/lib/passkey-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const gate = await requireOwner(req);
  if (!gate.ok) return gate.response;
  const { rpID, origin } = rpFromReq(req);
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: "Bad request." }, { status: 400 });
  const expectedChallenge = await takeChallenge(gate.uid);
  if (!expectedChallenge) return Response.json({ error: "That took too long — try again." }, { status: 400 });
  const passkeys = await listOwnerPasskeys(gate.uid);
  const match = passkeys.find((p) => p.id === body.id);
  if (!match) return Response.json({ error: "Unknown passkey." }, { status: 400 });

  let v;
  try {
    v = await verifyAuthenticationResponse({
      response: body, expectedChallenge, expectedOrigin: origin, expectedRPID: rpID,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      credential: { id: match.id, publicKey: bytesFromB64u(match.publicKey), counter: match.counter, transports: match.transports as any },
    });
  } catch {
    return Response.json({ error: "Verification failed." }, { status: 400 });
  }
  if (!v.verified) return Response.json({ error: "Passkey not verified." }, { status: 400 });
  await updatePasskeyCounter(match.id, v.authenticationInfo.newCounter);
  const token = await issueMintToken(gate.uid);
  return Response.json({ ok: true, token });
}
