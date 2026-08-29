import { NextRequest } from "next/server";
import { SignJWT, importPKCS8 } from "jose";
import { adminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";

// ByteLabs → Kube: redeem an opaque exchange code for a Firebase ID token.
// Called server-to-server by ByteLabs' /practical route after the learner
// lands there carrying a ?code= param.
//
// POST { code }
// → 200 { idToken, uid, email, courseId, topicId, mode }
// → 400 { error: "invalid_code" }    already redeemed or malformed
// → 410 { error: "code_expired" }    TTL elapsed
//
// Security: the code is single-use (Firestore transaction sets redeemed=true).
// The returned idToken is a real Firebase ID token minted for the uid via the
// custom-token flow (jose signs; Firebase REST API exchanges).

async function mintCustomToken(uid: string): Promise<string> {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!clientEmail || !rawKey) throw new Error("Service account not configured.");

  const privateKey = rawKey.replace(/\\n/g, "\n");
  const key = await importPKCS8(privateKey, "RS256");
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({ uid })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(clientEmail)
    .setSubject(clientEmail)
    .setAudience(
      "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit"
    )
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);
}

async function customTokenToIdToken(customToken: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) throw new Error("Firebase API key not configured.");

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Firebase token exchange failed (${res.status}): ${text}`);
  }
  const { idToken } = (await res.json()) as { idToken: string };
  return idToken;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_code" }, { status: 400 });
  }

  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!code) return Response.json({ error: "invalid_code" }, { status: 400 });

  const db = adminDb();
  const ref = db.collection("handoffCodes").doc(code);

  try {
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return { error: "invalid_code" as const };

      const d = snap.data()!;
      if (d.redeemed) return { error: "invalid_code" as const };
      if (Date.now() > d.expiresAt) return { error: "code_expired" as const };

      tx.update(ref, { redeemed: true, redeemedAt: Date.now() });
      return {
        uid: d.uid as string,
        email: d.email as string | null,
        courseId: d.courseId as string,
        topicId: d.topicId as string,
        mode: d.mode as "practice" | "evaluation",
      };
    });

    if ("error" in result) {
      const status = result.error === "code_expired" ? 410 : 400;
      return Response.json({ error: result.error }, { status });
    }

    const customToken = await mintCustomToken(result.uid);
    const idToken = await customTokenToIdToken(customToken);

    return Response.json({
      idToken,
      uid: result.uid,
      email: result.email,
      courseId: result.courseId,
      topicId: result.topicId,
      mode: result.mode,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Exchange failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
