"use client";

// Kube learn progress — one Firestore doc per user. Carries `userId` so the
// generic owner-only security rules cover it like every other collection.
import { doc, getDoc, setDoc, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export interface LearnProgress {
  completed: Record<string, true>;
}

export async function loadProgress(uid: string): Promise<LearnProgress> {
  const snap = await getDoc(doc(db(), "learnProgress", uid));
  if (!snap.exists()) return { completed: {} };
  const data = snap.data();
  return { completed: (data.completed as Record<string, true>) ?? {} };
}

export async function markTopicComplete(
  uid: string,
  topicId: string
): Promise<void> {
  await setDoc(
    doc(db(), "learnProgress", uid),
    {
      userId: uid,
      completed: { [topicId]: true },
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

export interface ExamAttemptRecord {
  mode: "open" | "closed";
  scope: string; // "unit-1" … "all" | "retest"
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
