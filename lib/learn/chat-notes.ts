"use client";

// Reader for the struggle-notes ledger (collection "chatNotes"). Each note is
// written by /api/learn/chat-note when the in-lesson tutor detects the student
// genuinely struggled on a slide. Until now these were written and never read —
// this reader folds them into the signal layer as a per-topic struggle count.
//
// Owner-only rules cover chatNotes via the userId field, so the client can
// query its own notes exactly like examAttempts.
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export interface StruggleSummary {
  /** Total struggle notes on the topic. */
  count: number;
  /** Notes where the tutor did NOT consider the confusion resolved in-chat —
   *  the ones that still deserve a second look. */
  unresolved: number;
  /** Most recent struggle timestamp (ms). */
  lastAt: number;
}

export async function loadStruggleNotes(
  uid: string,
  courseId: string
): Promise<Record<string, StruggleSummary>> {
  try {
    const snap = await getDocs(
      query(collection(db(), "chatNotes"), where("userId", "==", uid))
    );
    const out: Record<string, StruggleSummary> = {};
    for (const d of snap.docs) {
      const n = d.data() as {
        courseId?: string;
        topicId?: string;
        resolved?: boolean;
        createdAt?: number;
      };
      if (n.courseId !== courseId || !n.topicId) continue;
      const cur = out[n.topicId] ?? { count: 0, unresolved: 0, lastAt: 0 };
      cur.count += 1;
      if (!n.resolved) cur.unresolved += 1;
      cur.lastAt = Math.max(cur.lastAt, n.createdAt ?? 0);
      out[n.topicId] = cur;
    }
    return out;
  } catch {
    return {};
  }
}
