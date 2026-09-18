import { NextRequest } from "next/server";
import { requireEntitlement } from "@/lib/entitlement-server";
import { adminDb } from "@/lib/firebase/admin";
import { generateCourseFlashcards } from "@/lib/course/flashcards";
import { checkRateLimit } from "@/lib/rate-limit";
import type { Section } from "@/lib/course/types";

export const runtime = "nodejs";
export const maxDuration = 120;

// Fill in model-authored flashcards for a course's topics. Idempotent: only
// topics missing cards are (re)generated, unless `force` is passed. Owner-only
// (a course carries userId; crew members read the owner's result). This is how
// existing courses get real cards without a full re-digest — the Practice page
// triggers it lazily the first time a course still on the old fallback deck is
// opened.
export async function POST(req: NextRequest) {
  const gate = await requireEntitlement(req, "climb");
  if (!gate.ok) return gate.response;
  const uid = gate.uid;

  const rl = checkRateLimit(`flashcards:${uid}`, 6, 10 * 60_000);
  if (!rl.ok) {
    return Response.json(
      { error: "Kube's still sharpening cards — try again in a few minutes." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const courseId = (body.courseId || "").toString();
  const force = body.force === true;
  if (!courseId) return Response.json({ error: "Missing course." }, { status: 400 });

  const ref = adminDb().collection("courses").doc(courseId);
  const snap = await ref.get();
  if (!snap.exists || snap.get("userId") !== uid) {
    return Response.json({ error: "Course not found." }, { status: 404 });
  }

  const title = (snap.get("title") as string) || "your course";
  const sections = (snap.get("sections") as Section[]) ?? [];

  const need = sections
    .flatMap((s) => s.topics)
    .filter(
      (t) =>
        t.kind !== "review" &&
        (force || !(t.flashcards?.length)) &&
        (t.recap ?? []).some((l) => l.trim())
    )
    .map((t) => ({ id: t.id, title: t.title, recap: t.recap ?? [] }));

  if (need.length === 0) {
    return Response.json({ generated: 0, note: "Cards already sharp." });
  }

  const cards = await generateCourseFlashcards(title, need);
  const ids = Object.keys(cards);
  if (ids.length === 0) return Response.json({ generated: 0 });

  // Single owner writer, so a plain merge of the whole sections array is safe.
  const merged = sections.map((s) => ({
    ...s,
    topics: s.topics.map((t) =>
      cards[t.id] ? { ...t, flashcards: cards[t.id] } : t
    ),
  }));

  await ref.set({ sections: merged, updatedAt: Date.now() }, { merge: true });
  return Response.json({ generated: ids.length });
}
