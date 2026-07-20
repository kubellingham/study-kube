"use client";

// Kube learn progress — one Firestore doc per user PER COURSE. Docs carry
// `userId` so the generic owner-only security rules cover them.
//
// IMPORTANT: the rules deny reads of documents that don't exist yet
// (owns(resource.data) errors when resource is null), so a first-time user's
// getDoc REJECTS with permission-denied rather than returning "no doc".
// loadProgress must treat that as a fresh start, never throw — otherwise the
// path page hangs on "Loading your path" forever.
import { doc, getDoc, setDoc, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export interface LearnProgress {
  completed: Record<string, true>;
}

function progressDocId(uid: string, courseId: string): string {
  return `${uid}__${courseId}`;
}

export async function loadProgress(
  uid: string,
  courseId: string
): Promise<LearnProgress> {
  try {
    const snap = await getDoc(
      doc(db(), "learnProgress", progressDocId(uid, courseId))
    );
    if (!snap.exists()) return { completed: {} };
    const data = snap.data();
    return { completed: (data.completed as Record<string, true>) ?? {} };
  } catch {
    // Missing doc (permission-denied under our rules) or a transient network
    // failure: start from an empty map rather than blocking the page.
    return { completed: {} };
  }
}

export async function markTopicComplete(
  uid: string,
  courseId: string,
  topicId: string
): Promise<void> {
  await setDoc(
    doc(db(), "learnProgress", progressDocId(uid, courseId)),
    {
      userId: uid,
      courseId,
      completed: { [topicId]: true },
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

export interface ExamAttemptRecord {
  courseId: string;
  mode: "open" | "closed";
  scope: string; // "unit-1" … "all" | "retest of weak topics"
  score: number;
  total: number;
  hintsUsed: number;
  perTopic: Record<string, { correct: number; total: number }>;
  takenAt: number;
}

export async function saveExamAttempt(
  uid: string,
  attempt: ExamAttemptRecord
): Promise<void> {
  await addDoc(collection(db(), "examAttempts"), { userId: uid, ...attempt });
}
