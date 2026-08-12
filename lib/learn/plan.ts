"use client";

// Your study plan: which semester each subject belongs to, and which semester
// you're actually in right now.
//
// One doc per user (id = uid) rather than a field on each course, for two
// reasons: built-in courses live in code and have no Firestore doc to write to,
// and grouping the whole shelf is a single read instead of one per subject.
//
// Semesters are plain numbers. A subject with no number isn't "wrong" — it's
// just unfiled, and it still shows up on the shelf.
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export const SEMESTER_MIN = 1;
export const SEMESTER_MAX = 12;
export const SEMESTERS = Array.from(
  { length: SEMESTER_MAX - SEMESTER_MIN + 1 },
  (_, i) => SEMESTER_MIN + i
);

export interface StudyPlan {
  /** The semester you're in now — the one the shelf opens on. */
  currentSemester: number | null;
  /** courseId → semester. Missing means unfiled. */
  semesters: Record<string, number>;
}

export const emptyPlan = (): StudyPlan => ({ currentSemester: null, semesters: {} });

const validSem = (n: unknown): n is number =>
  typeof n === "number" && Number.isInteger(n) && n >= SEMESTER_MIN && n <= SEMESTER_MAX;

export async function loadPlan(uid: string): Promise<StudyPlan> {
  try {
    const snap = await getDoc(doc(db(), "studyPlan", uid));
    if (!snap.exists()) return emptyPlan();
    const data = snap.data();
    const raw = (data.semesters as Record<string, unknown>) ?? {};
    const semesters: Record<string, number> = {};
    for (const [courseId, sem] of Object.entries(raw)) {
      if (validSem(sem)) semesters[courseId] = sem;
    }
    return {
      currentSemester: validSem(data.currentSemester) ? data.currentSemester : null,
      semesters,
    };
  } catch {
    // Missing doc reads as permission-denied under our rules (see progress.ts);
    // an unfiled shelf is the right fallback, never a blocked page.
    return emptyPlan();
  }
}

/** File a subject under a semester, or pass null to unfile it. */
export async function setCourseSemester(
  uid: string,
  courseId: string,
  semester: number | null
): Promise<void> {
  const value = semester === null ? null : validSem(semester) ? semester : null;
  await setDoc(
    doc(db(), "studyPlan", uid),
    { userId: uid, semesters: { [courseId]: value }, updatedAt: Date.now() },
    { merge: true }
  );
}

/** Set the semester you're in — what the shelf opens on. */
export async function setCurrentSemester(uid: string, semester: number | null): Promise<void> {
  await setDoc(
    doc(db(), "studyPlan", uid),
    {
      userId: uid,
      currentSemester: semester !== null && validSem(semester) ? semester : null,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

export interface Grouped<T> {
  /** Null = the unfiled bucket. */
  semester: number | null;
  items: T[];
}

/**
 * Group subjects by semester for display: the current semester first, then the
 * rest newest-first, then anything unfiled. Empty groups are dropped — except
 * the current semester, which is kept even when empty so a student who has
 * filed nothing yet still sees where their subjects are meant to go.
 */
export function groupBySemester<T extends { id: string }>(
  subjects: T[],
  plan: StudyPlan
): Grouped<T>[] {
  const buckets = new Map<number | null, T[]>();
  for (const s of subjects) {
    const sem = plan.semesters[s.id] ?? null;
    const list = buckets.get(sem);
    if (list) list.push(s);
    else buckets.set(sem, [s]);
  }

  const current = plan.currentSemester;
  const out: Grouped<T>[] = [];
  if (current !== null) out.push({ semester: current, items: buckets.get(current) ?? [] });

  const rest = [...buckets.keys()]
    .filter((k): k is number => k !== null && k !== current)
    .sort((a, b) => b - a);
  for (const sem of rest) out.push({ semester: sem, items: buckets.get(sem)! });

  const unfiled = buckets.get(null);
  if (unfiled?.length) out.push({ semester: null, items: unfiled });
  return out;
}

/** "Semester 4" / "Not in a semester yet". */
export const semesterLabel = (sem: number | null): string =>
  sem === null ? "Not in a semester yet" : `Semester ${sem}`;

/**
 * The obvious guess at which semester someone is in, for a first-run default:
 * the highest semester they've filed anything under. Null when nothing is
 * filed — we ask rather than invent one.
 */
export function inferCurrentSemester(plan: StudyPlan): number | null {
  const used = Object.values(plan.semesters);
  return used.length ? Math.max(...used) : null;
}
