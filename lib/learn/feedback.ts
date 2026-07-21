"use client";

// Per-slide thumbs — one Firestore doc per user per course, votes keyed
// `${topicId}::${lessonId}::${stepIdx}` with 1 (up) or -1 (down). The record
// exists so slide quality can be analyzed later (which slides people dislike
// → where the prompt/schema needs tightening); it never changes the notes.
import { doc, getDoc, setDoc, deleteField } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type SlideVote = 1 | -1;
export type SlideVotes = Record<string, SlideVote>;

function feedbackDocId(uid: string, courseId: string): string {
  return `${uid}__${courseId}`;
}

export function slideKey(topicId: string, lessonId: string, stepIdx: number): string {
  return `${topicId}::${lessonId}::${stepIdx}`;
}

export async function loadSlideVotes(uid: string, courseId: string): Promise<SlideVotes> {
  try {
    const snap = await getDoc(doc(db(), "slideFeedback", feedbackDocId(uid, courseId)));
    if (!snap.exists()) return {};
    return (snap.data().votes as SlideVotes) ?? {};
  } catch {
    return {}; // missing doc reads deny under our rules — fresh start
  }
}

/** Set, change, or (when vote is null) clear one slide's vote. */
export async function saveSlideVote(
  uid: string,
  courseId: string,
  key: string,
  vote: SlideVote | null
): Promise<void> {
  await setDoc(
    doc(db(), "slideFeedback", feedbackDocId(uid, courseId)),
    {
      userId: uid,
      courseId,
      votes: { [key]: vote === null ? deleteField() : vote },
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}
