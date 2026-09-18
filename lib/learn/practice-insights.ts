"use client";

// Practice behaviour — how a student actually drills. Reads practice_session
// events (which tool they opened) and turns the pattern into ONE gentle,
// evidence-based nudge. Recommend-only: it never changes what they do, it just
// points. The headline signal is recognition-vs-recall — most students lean on
// flashcards/matching (recognising an answer) and skip Definitions (producing
// it from memory), yet free recall is the stronger technique for retention.
import { loadEvents } from "@/lib/learn/events";

export type PracticeMode = "flashcards" | "matching" | "definitions" | "sprint";

const RECALL: PracticeMode[] = ["definitions"];

export interface PracticeBehaviour {
  enough: boolean;
  byMode: Record<PracticeMode, number>;
  total: number;
  /** One calm suggestion, or null when their mix is already healthy / too
   *  little data to say. */
  suggestion: string | null;
}

const MODES: PracticeMode[] = ["flashcards", "matching", "definitions", "sprint"];

export function computePracticeBehaviour(
  events: { type: string; mode?: string }[]
): PracticeBehaviour {
  const byMode: Record<PracticeMode, number> = {
    flashcards: 0,
    matching: 0,
    definitions: 0,
    sprint: 0,
  };
  for (const e of events) {
    if (e.type !== "practice_session") continue;
    if (e.mode && (MODES as string[]).includes(e.mode)) byMode[e.mode as PracticeMode] += 1;
  }
  const total = MODES.reduce((n, m) => n + byMode[m], 0);
  const enough = total >= 4;

  let suggestion: string | null = null;
  if (enough) {
    const recall = RECALL.reduce((n, m) => n + byMode[m], 0);
    if (recall === 0) {
      suggestion =
        "You practise by recognising answers. Try Definitions — recalling in your own words sticks far better.";
    } else if (recall / total < 0.15) {
      suggestion =
        "A little more Definitions would help — producing answers from memory beats recognising them.";
    } else if (byMode.sprint === 0) {
      suggestion = "You haven't tried a Timed Sprint yet — a fun 60-second way to firm up the easy wins.";
    }
    // Otherwise their mix is healthy; stay quiet.
  }

  return { enough, byMode, total, suggestion };
}

export async function loadPracticeBehaviour(
  uid: string,
  courseId: string
): Promise<PracticeBehaviour> {
  const events = await loadEvents(uid, { courseId, types: ["practice_session"] });
  return computePracticeBehaviour(events);
}
