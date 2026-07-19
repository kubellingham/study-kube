import { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import type { Material } from "@/lib/types";

/** Verify the Firebase ID token from the Authorization header. */
export async function getUid(req: NextRequest): Promise<string | null> {
  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer (.+)$/i);
  if (!match) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(match[1]);
    return decoded.uid;
  } catch {
    return null;
  }
}

/**
 * Resolve the signed-in user and one of their materials. Ownership is enforced
 * by comparing the material's userId to the verified uid.
 */
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
