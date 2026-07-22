"use client";

// The mistakes ledger — every exam-bank question a student has gotten wrong,
// per user per course. Pairs with the flags ledger to power the "Mistakes &
// Flags" page (a place to face, re-explain, and re-test exactly what tripped
// you up). Owner-only via the userId field.
import { doc, getDoc, setDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export interface MistakeMeta {
  topicId: string;
  count: number;
  at: number;
}
export type Mistakes = Record<string, MistakeMeta>;

function mistakesDocId(uid: string, courseId: string): string {
  return `${uid}__${courseId}`;
}

export async function loadMistakes(uid: string, courseId: string): Promise<Mistakes> {
  try {
    const snap = await getDoc(doc(db(), "mistakes", mistakesDocId(uid, courseId)));
    if (!snap.exists()) return {};
    return (snap.data().items as Mistakes) ?? {};
  } catch {
    return {};
  }
}

/** Record a batch of missed questions (from one exam sitting). Nested-object
 *  merge so per-question `count` increments accumulate across sittings. */
export async function recordMistakes(
  uid: string,
  courseId: string,
  missed: { id: string; topicId: string }[]
): Promise<void> {
  if (missed.length === 0) return;
  const now = Date.now();
  const items: Record<string, unknown> = {};
  for (const m of missed) {
    items[m.id] = { topicId: m.topicId, at: now, count: increment(1) };
  }
  await setDoc(
    doc(db(), "mistakes", mistakesDocId(uid, courseId)),
    { userId: uid, courseId, updatedAt: now, items },
    { merge: true }
  );
}

/** Clear one entry once the student has re-mastered it (optional cleanup). */
export async function clearMistake(uid: string, courseId: string, id: string): Promise<void> {
  const { deleteField } = await import("firebase/firestore");
  await setDoc(
    doc(db(), "mistakes", mistakesDocId(uid, courseId)),
    { [`items.${id}`]: deleteField(), updatedAt: Date.now() },
    { merge: true }
  );
}
