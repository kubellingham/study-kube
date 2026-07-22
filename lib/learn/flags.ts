"use client";

// "Flag it" — the honesty mark. On any question a student can tap a flag
// (black outline → filled) to tell Kube "I don't actually get this — come
// back and explain," even when they answered correctly (a lucky guess in a
// closed exam still shouldn't count as understood). One Firestore doc per
// user per course; owner-only via the userId field. This is the "revisit"
// ledger that reviews and personalized questions will draw on.
import { doc, getDoc, setDoc, deleteField } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export interface FlagMeta {
  topicId?: string;
  prompt: string;
  at: number;
}
export type Flags = Record<string, FlagMeta>;

/** Stable key from a question's prompt (authored checks have no id). */
export function flagKey(prompt: string): string {
  let h = 5381;
  for (let i = 0; i < prompt.length; i++) h = (((h << 5) + h) + prompt.charCodeAt(i)) | 0;
  return "q" + (h >>> 0).toString(36);
}

function flagsDocId(uid: string, courseId: string): string {
  return `${uid}__${courseId}`;
}

export async function loadFlags(uid: string, courseId: string): Promise<Flags> {
  try {
    const snap = await getDoc(doc(db(), "questionFlags", flagsDocId(uid, courseId)));
    if (!snap.exists()) return {};
    return (snap.data().flags as Flags) ?? {};
  } catch {
    return {};
  }
}

/** Set (meta) or clear (null) one flag. */
export async function saveFlag(
  uid: string,
  courseId: string,
  key: string,
  meta: FlagMeta | null
): Promise<void> {
  await setDoc(
    doc(db(), "questionFlags", flagsDocId(uid, courseId)),
    {
      userId: uid,
      courseId,
      flags: { [key]: meta === null ? deleteField() : meta },
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}
