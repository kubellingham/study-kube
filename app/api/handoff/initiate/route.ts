import { randomBytes } from "crypto";
import { NextRequest } from "next/server";
import { getAuth } from "@/lib/api-helpers";
import { adminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";

// Kube → ByteLabs handoff: generate a short-lived exchange code and return
// the ByteLabs redirect URL. The learner is never shown the code — Kube
// redirects them server-side and ByteLabs' /practical page redeems it
// server-to-server before the learner sees anything.
//
// POST { courseId, topicId, mode? }
// → 200 { redirectUrl }
//
// The code is a 32-byte base64url nonce stored in Firestore for 60 s, single-
// use. ByteLabs redeems it via /api/handoff/exchange.

const CODE_TTL_MS = 60_000;

function bytelabsHost(): string {
  return process.env.BYTELABS_HOST ?? "https://bytelabs-rosy.vercel.app";
}

function kubeHost(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://studying-kube.vercel.app";
}

export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return Response.json({ error: "Not signed in." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const courseId = typeof body.courseId === "string" ? body.courseId.trim() : "";
  const topicId = typeof body.topicId === "string" ? body.topicId.trim() : "";
  const mode = body.mode === "evaluation" ? "evaluation" : "practice";

  if (!courseId || !topicId) {
    return Response.json({ error: "courseId and topicId are required." }, { status: 400 });
  }

  const code = randomBytes(32).toString("base64url");
  const now = Date.now();
  const expiresAt = now + CODE_TTL_MS;

  await adminDb().collection("handoffCodes").doc(code).set({
    uid: auth.uid,
    email: auth.email,
    courseId,
    topicId,
    mode,
    expiresAt,
    redeemed: false,
    createdAt: now,
  });

  const returnUrl = `${kubeHost()}/learn/${courseId}/lesson/${encodeURIComponent(topicId)}`;
  const redirectUrl =
    `${bytelabsHost()}/handoff` +
    `?code=${encodeURIComponent(code)}` +
    `&return=${encodeURIComponent(returnUrl)}`;

  return Response.json({ redirectUrl });
}
