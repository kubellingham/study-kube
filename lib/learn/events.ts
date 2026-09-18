"use client";

// The event-log spine. Kube stores plenty of current-STATE (completed, ease,
// mistakes) but almost no history — so it can't yet see WHEN a student studies
// or HOW their first-try accuracy moves over a term. This is an append-only
// log of things-that-happened, the substrate the rhythm (S5), practice (S6)
// and trajectory (S7) layers read. Every doc carries userId, so the generic
// owner-only Firestore rules cover it; querying mirrors examAttempts.
//
// Deliberately cheap: a throttled study "ping" for rhythm and one row per
// lesson check for trajectory — not a write per keystroke. Practice-level
// capture lands in S6 on this same spine.
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export type LearningEventType = "session_ping" | "lesson_check" | "practice_session";

export interface LearningEvent {
  userId: string;
  courseId: string;
  type: LearningEventType;
  /** ms epoch when it happened. */
  ts: number;
  topicId?: string;
  /** lesson_check: was the FIRST attempt correct? */
  correct?: boolean;
  /** practice_session: which tool. */
  mode?: string;
  /** practice_session: items seen / got right. */
  count?: number;
  hits?: number;
}

/** Append one event. Fire-and-forget — telemetry must never break a study
 *  flow, so every failure is swallowed. */
export function recordEvent(
  uid: string,
  courseId: string,
  type: LearningEventType,
  data: Partial<Omit<LearningEvent, "userId" | "courseId" | "type" | "ts">> = {}
): void {
  try {
    void addDoc(collection(db(), "learningEvents"), {
      userId: uid,
      courseId,
      type,
      ts: Date.now(),
      ...data,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

const PING_MS = 30 * 60 * 1000;

/** A study heartbeat, at most once per 30 min per user — enough for the
 *  rhythm layer to know WHEN someone studies without a write per action. */
export function pingStudy(uid: string, courseId: string): void {
  const key = `kube-ping-${uid}`;
  try {
    const last = Number(localStorage.getItem(key) || 0);
    if (Date.now() - last < PING_MS) return;
    localStorage.setItem(key, String(Date.now()));
  } catch {
    /* storage blocked — fall through and record anyway */
  }
  recordEvent(uid, courseId, "session_ping");
}

/** Load this user's events, newest-friendly (sorted oldest→newest). Filtered
 *  client-side by course / time / type, mirroring loadExamSummary's single
 *  userId index. */
export async function loadEvents(
  uid: string,
  opts: { courseId?: string; sinceTs?: number; types?: LearningEventType[] } = {}
): Promise<LearningEvent[]> {
  try {
    const snap = await getDocs(
      query(collection(db(), "learningEvents"), where("userId", "==", uid))
    );
    let rows = snap.docs.map((d) => d.data() as LearningEvent);
    if (opts.courseId) rows = rows.filter((e) => e.courseId === opts.courseId);
    if (opts.sinceTs != null) rows = rows.filter((e) => e.ts >= opts.sinceTs!);
    if (opts.types) rows = rows.filter((e) => opts.types!.includes(e.type));
    return rows.sort((a, b) => a.ts - b.ts);
  } catch {
    return [];
  }
}
