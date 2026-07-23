import { NextRequest } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { requireOwner } from "@/lib/admin-guard";
import { rpFromReq, takeChallenge, savePasskey, b64uFromBytes } from "@/lib/passkey-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const gate = await requireOwner(req);
  if (!gate.ok) return gate.response;
  const { rpID, origin } = rpFromReq(req);
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: "Bad request." }, { status: 400 });
  const expectedChallenge = await takeChallenge(gate.uid);
  if (!expectedChallenge) return Response.json({ error: "That took too long — try again." }, { status: 400 });

  let v;
  try {
    v = await verifyRegistrationResponse({ response: body, expectedChallenge, expectedOrigin: origin, expectedRPID: rpID });
  } catch {
    return Response.json({ error: "Could not verify that passkey." }, { status: 400 });
  }
  if (!v.verified || !v.registrationInfo) return Response.json({ error: "Passkey not verified." }, { status: 400 });
  const c = v.registrationInfo.credential;
  await savePasskey({
    id: c.id, uid: gate.uid, email: gate.email,
    publicKey: b64uFromBytes(c.publicKey), counter: c.counter, transports: c.transports, createdAt: Date.now(),
  });
  return Response.json({ ok: true });
}
