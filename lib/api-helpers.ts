import { NextRequest } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { adminDb } from "@/lib/firebase/admin";
import type { Material } from "@/lib/types";

// Firebase ID tokens are standard RS256 JWTs. We verify them directly against
// Google's public signing keys with `jose` instead of firebase-admin/auth,
// whose jwks-rsa -> jose require() chain crashes on Vercel's serverless
// runtime (ERR_REQUIRE_ESM). jose is bundled into this function by webpack,
// so no runtime module resolution is involved.
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

function firebaseProjectId(): string | undefined {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

/** Verify the Firebase ID token from the Authorization header. */
export async function getUid(req: NextRequest): Promise<string | null> {
  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer (.+)$/i);
  if (!match) return null;
  const projectId = firebaseProjectId();
  if (!projectId) return null;
  try {
    // Verification rules per Firebase docs: RS256 signature against Google's
    // JWKS, issuer https://securetoken.google.com/<projectId>, audience
    // <projectId>, and a non-empty sub (the uid). exp/iat are checked by jose.
    const { payload } = await jwtVerify(match[1], FIREBASE_JWKS, {
      algorithms: ["RS256"],
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    return typeof payload.sub === "string" && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function requireMaterial(
  req: NextRequest,
  materialId: unknown
): Promise<
  | { ok: true; uid: string; material: Material }
  | { ok: false; response: Response }
> {
  const uid = await getUid(req);
  if (!uid) {
    return {
      ok: false,
      response: Response.json({ error: "Not signed in." }, { status: 401 }),
    };
  }
  if (typeof materialId !== "string" || !materialId) {
    return {
      ok: false,
      response: Response.json({ error: "Missing material_id." }, { status: 400 }),
    };
  }
  const snap = await adminDb().collection("materials").doc(materialId).get();
  if (!snap.exists || snap.get("userId") !== uid) {
    return {
      ok: false,
      response: Response.json({ error: "Material not found." }, { status: 404 }),
    };
  }
  const material = { id: snap.id, ...snap.data() } as Material;
  return { ok: true, uid, material };
}
