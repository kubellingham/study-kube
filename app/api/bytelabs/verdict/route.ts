import { NextRequest } from "next/server";
import { getAuth } from "@/lib/api-helpers";
import { adminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";

// ByteLabs POSTs this when a practical ends. Kube writes the verdict to the
// byteLabsSignals collection (separate from mistakes/flags — provenance stays
// clean) and returns a kubeAction that tells ByteLabs where to send the learner.
//
// POST { course, topic, verdict, evidence?, concepts?, artifact?, outOfBand?,
//        windowId?, attemptId? }
// → 200 { acknowledged, kubeAction, redirectUrl }
//
// kubeAction:
//   "advance-topic"   solid verdict — topic mastered, advance the ladder
//   "flag-topic"      shaky verdict — needs work but keep going
//   "re-open-topic"   stuck verdict — send learner back to the theory

type Verdict = "solid" | "shaky" | "stuck";
type KubeAction = "advance-topic" | "flag-topic" | "re-open-topic";

function kubeAction(verdict: Verdict): KubeAction {
  if (verdict === "solid") return "advance-topic";
  if (verdict === "stuck") return "re-open-topic";
  return "flag-topic";
}

function kubeHost(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://studying-kube.vercel.app";
}

const VALID_VERDICTS = new Set<string>(["solid", "shaky", "stuck"]);

export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return Response.json({ error: "Not signed in." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const courseId = typeof body.course === "string" ? body.course.trim() : "";
  const topicId = typeof body.topic === "string" ? body.topic.trim() : "";
  const verdict = typeof body.verdict === "string" ? body.verdict.trim() : "";

  if (!courseId || !topicId) {
    return Response.json({ error: "course and topic are required." }, { status: 400 });
  }
  if (!VALID_VERDICTS.has(verdict)) {
    return Response.json(
      { error: 'verdict must be "solid", "shaky", or "stuck".' },
      { status: 400 }
    );
  }

  const signal: Record<string, unknown> = {
    uid: auth.uid,
    courseId,
    topicId,
    verdict,
    at: Date.now(),
  };

  if (typeof body.evidence === "string") signal.evidence = body.evidence;
  if (body.concepts && typeof body.concepts === "object") signal.concepts = body.concepts;
  if (body.artifact && typeof body.artifact === "object") signal.artifact = body.artifact;
  if (typeof body.outOfBand === "boolean") signal.outOfBand = body.outOfBand;
  if (typeof body.windowId === "string") signal.windowId = body.windowId;
  if (typeof body.attemptId === "string") signal.attemptId = body.attemptId;

  try {
    await adminDb().collection("byteLabsSignals").add(signal);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save verdict.";
    return Response.json({ error: message }, { status: 500 });
  }

  const action = kubeAction(verdict as Verdict);
  const redirectUrl = `${kubeHost()}/learn/${courseId}/lesson?topic=${encodeURIComponent(topicId)}`;

  return Response.json({
    acknowledged: true,
    kubeAction: action,
    redirectUrl,
  });
}
