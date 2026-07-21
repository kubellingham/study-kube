"use client";

// Practice Hub state — one Firestore doc per user per course. Holds the
// SM-2-lite schedule that flashcard self-grades drive (KUBE_CASUAL_AND_
// PRACTICE.md §3c) and the Timed Sprint personal best (§3d). Owner-only
// rules cover it via the userId field; missing-doc reads deny under our
// rules, so loads never throw.
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export interface CardState {
  /** SM-2 ease factor. */
  ease: number;
  /** Days until due. */
  intervalDays: number;
  /** ms epoch when the card is next due. */
  dueAt: number;
  reps: number;
}

export interface PracticeState {
  cards: Record<string, CardState>;
  sprintBest: number;
}

function practiceDocId(uid: string, courseId: string): string {
  return `${uid}__${courseId}`;
}

export async function loadPracticeState(
  uid: string,
  courseId: string
): Promise<PracticeState> {
  try {
    const snap = await getDoc(doc(db(), "practiceState", practiceDocId(uid, courseId)));
    if (!snap.exists()) return { cards: {}, sprintBest: 0 };
    const data = snap.data();
    return {
      cards: (data.cards as Record<string, CardState>) ?? {},
      sprintBest: (data.sprintBest as number) ?? 0,
    };
  } catch {
    return { cards: {}, sprintBest: 0 };
  }
}

/** SM-2-lite step. "got it" drifts the card far; "needs work" brings it back
 *  soon. Deliberately gentle — two directions only, matching the swipe. */
export function nextCardState(prev: CardState | undefined, gotIt: boolean, now: number): CardState {
  const base: CardState = prev ?? { ease: 2.3, intervalDays: 0, dueAt: now, reps: 0 };
  if (!gotIt) {
    // Needs work: resurface within a day, nudge ease down a little.
    return {
      ease: Math.max(1.6, base.ease - 0.2),
      intervalDays: 0,
      dueAt: now + 12 * 60 * 60 * 1000,
      reps: base.reps + 1,
    };
  }
  const nextInterval =
    base.reps === 0 ? 1 : base.reps === 1 ? 3 : Math.round(base.intervalDays * base.ease) || 3;
  return {
    ease: Math.min(2.8, base.ease + 0.06),
    intervalDays: nextInterval,
    dueAt: now + nextInterval * 24 * 60 * 60 * 1000,
    reps: base.reps + 1,
  };
}

export async function saveCardStates(
  uid: string,
  courseId: string,
  cards: Record<string, CardState>
): Promise<void> {
  await setDoc(
    doc(db(), "practiceState", practiceDocId(uid, courseId)),
    { userId: uid, courseId, cards, updatedAt: Date.now() },
    { merge: true }
  );
}

export async function saveSprintBest(
  uid: string,
  courseId: string,
  best: number
): Promise<void> {
  await setDoc(
    doc(db(), "practiceState", practiceDocId(uid, courseId)),
    { userId: uid, courseId, sprintBest: best, updatedAt: Date.now() },
    { merge: true }
  );
}

/** Order a concept deck by urgency: due (or never-seen) cards first, then by
 *  soonest due — so the deck quietly bends toward weak spots. */
export function bySpacing<T extends { id: string }>(
  items: T[],
  cards: Record<string, CardState>,
  now: number
): T[] {
  return [...items].sort((a, b) => {
    const da = cards[a.id]?.dueAt ?? 0;
    const dbb = cards[b.id]?.dueAt ?? 0;
    const aDue = da <= now;
    const bDue = dbb <= now;
    if (aDue !== bDue) return aDue ? -1 : 1;
    return da - dbb;
  });
}
