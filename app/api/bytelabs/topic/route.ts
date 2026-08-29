import { NextRequest } from "next/server";
import { getAuth } from "@/lib/api-helpers";
import { adminDb } from "@/lib/firebase/admin";
import { getBuiltinBundle } from "@/lib/course";
import { buildConceptPool } from "@/lib/course/concepts";

export const runtime = "nodejs";

// ByteLabs fetches this on lesson-start to get the topic payload and the
// learner's current weak-spot signals. Called server-to-server with the
// learner's Firebase ID token (obtained via /api/handoff/exchange).
//
// GET ?course=<courseId>&topic=<topicId>
// → 200 { topic, signals, mode, conceptTells }
//
// signals: the three Kube weak-spot signals for this topic
//   reviewMisses  — count of review-node misses
//   mistakes      — count of MCQ wrong answers
//   flags         — array of flagged question keys (learner self-reported "I don't get this")
//
// conceptTells: { term, tell }[] — for ghost-fade weighting in ByteLabs

type Mode = "practice" | "evaluation";

function kubeHost(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://studying-kube.vercel.app";
}

function docId(uid: string, courseId: string): string {
  return `${uid}__${courseId}`;
}

export async function GET(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return Response.json({ error: "Not signed in." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("course") ?? "";
  const topicId = searchParams.get("topic") ?? "";

  if (!courseId || !topicId) {
    return Response.json({ error: "course and topic params are required." }, { status: 400 });
  }

  const bundle = getBuiltinBundle(courseId, auth.email);
  if (!bundle) {
    return Response.json({ error: "Course not found." }, { status: 404 });
  }

  const topic = bundle.getTopic(topicId);
  if (!topic) {
    return Response.json({ error: "Topic not found." }, { status: 404 });
  }

  const db = adminDb();
  const id = docId(auth.uid, courseId);

  const [progressSnap, mistakesSnap, flagsSnap] = await Promise.all([
    db.collection("learnProgress").doc(id).get().catch(() => null),
    db.collection("mistakes").doc(id).get().catch(() => null),
    db.collection("questionFlags").doc(id).get().catch(() => null),
  ]);

  const reviewMisses =
    (progressSnap?.data()?.reviewMisses as Record<string, number> | undefined)?.[topicId] ?? 0;

  const mistakeItems = (mistakesSnap?.data()?.items as Record<string, { topicId: string }> | undefined) ?? {};
  const mistakeCount = Object.values(mistakeItems).filter((m) => m.topicId === topicId).length;

  const flagItems = (flagsSnap?.data()?.flags as Record<string, { topicId?: string }> | undefined) ?? {};
  const flags = Object.entries(flagItems)
    .filter(([, f]) => f.topicId === topicId)
    .map(([key]) => key);

  const conceptPool = buildConceptPool(bundle);
  const conceptTells = conceptPool
    .filter((c) => c.id === topicId)
    .map((c) => ({ term: c.term, tell: c.tell }));

  const depTitles = topic.deps
    .map((depId) => {
      const dep = bundle.getTopic(depId);
      return dep ? { id: depId, title: dep.title } : null;
    })
    .filter(Boolean);

  // Mode: "practice" for all topics today. Evaluation windows are a Phase 2
  // concept (graded lab sessions with windowId/opensAt/closesAt). Until that
  // schema exists the mode is always practice.
  const mode: Mode = "practice";

  const returnUrl = `${kubeHost()}/learn/${courseId}/lesson?topic=${encodeURIComponent(topicId)}`;

  return Response.json({
    topic: {
      id: topic.id,
      title: topic.title,
      unit: topic.unit,
      weight: topic.weight,
      whyItMatters: topic.whyItMatters,
      recap: topic.recap,
      deps: depTitles,
    },
    signals: {
      reviewMisses,
      mistakes: mistakeCount,
      flags,
    },
    mode,
    conceptTells,
    returnUrl,
  });
}
