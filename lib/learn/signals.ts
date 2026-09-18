"use client";

// The signal layer — Kube's single honest read of how a student is doing on
// each topic. Everything here already lived in the database; it was just never
// read back in one place. This gathers six signals per topic and collapses
// them into ONE state + a plain-English reason, so the ladder and the Practice
// hub can say true things like "you've been struggling with Normalization".
//
// Signals (all pre-existing):
//   completed       learnProgress.completed        did they finish the topic
//   exam            examAttempts.perTopic          correct / total across attempts
//   mistakes        mistakes.items                 wrong exam-bank questions
//   reviewMisses    learnProgress.reviewMisses     missed in a review node
//   flags           questionFlags.flags            self-reported "I don't get this"
//   struggles       chatNotes                      tutor detected real confusion
//   ease            practiceState.cards[id].ease   SM-2 ease (1.6 hard → 2.8 easy)
//
// Read-only. This layer observes and reports; it never changes the path.
import { loadProgress } from "@/lib/learn/progress";
import { loadExamPerTopic } from "@/lib/learn/progress";
import { loadMistakes } from "@/lib/learn/mistakes";
import { loadFlags } from "@/lib/learn/flags";
import { loadPracticeState } from "@/lib/learn/practice";
import { loadStruggleNotes } from "@/lib/learn/chat-notes";

export type TopicState = "untouched" | "solid" | "shaky" | "needs-reinforcement";

// Completion is not mastery. This five-level ladder distinguishes finishing a
// topic from actually performing on it. "mastered" needs positive proof
// (strong exam ratio or a high, settled flashcard ease), not just a checkmark.
export type Mastery =
  | "not-started"
  | "started"
  | "completed"
  | "mastered"
  | "needs-reinforcement";

export interface TopicSignal {
  topicId: string;
  title: string;
  unit: number;
  completed: boolean;
  exam: { correct: number; total: number; ratio: number | null };
  mistakes: number;
  reviewMisses: number;
  flags: number;
  struggles: number;
  ease: number | null;
  state: TopicState;
  /** Completion-aware level: finishing ≠ mastering. */
  mastery: Mastery;
  /** One warm, specific line naming why Kube flagged (or trusts) this topic. */
  reason: string;
  /** A rough 0–100 for display rails. Exam ratio when known, else a state
   *  proxy. Null when the topic is untouched (nothing to show). */
  masteryPct: number | null;
  /** Internal ranking weight — higher = more concerning. */
  concern: number;
}

export interface CourseSignals {
  byTopic: Record<string, TopicSignal>;
  /** Topics that need attention, most concerning first (excludes solid /
   *  untouched). Capped by the caller. */
  weak: TopicSignal[];
}

export interface RawSignals {
  completed: Record<string, true>;
  reviewMisses: Record<string, number>;
  examPerTopic: Record<string, { correct: number; total: number }>;
  mistakesByTopic: Record<string, number>;
  flagsByTopic: Record<string, number>;
  strugglesByTopic: Record<string, number>;
  easeByTopic: Record<string, number>;
}

// Thresholds in one place so the definition of "struggling" is auditable and
// tunable. Deliberately conservative: we'd rather stay quiet than nag.
const EXAM_STRONG = 0.5; // below this = clear gap
const EXAM_MILD = 0.8; // below this = wobbly
const EASE_STRONG = 1.8; // SM-2 ease at/below = the deck keeps resurfacing it
const EASE_MILD = 2.0;

/** Pure: turn the gathered raw maps into per-topic signals + a weak list. */
export function deriveTopicSignals(
  topics: { id: string; title: string; unit?: number }[],
  raw: RawSignals
): CourseSignals {
  const byTopic: Record<string, TopicSignal> = {};

  for (const t of topics) {
    const id = t.id;
    const completed = !!raw.completed[id];
    const ex = raw.examPerTopic[id];
    const ratio = ex && ex.total > 0 ? ex.correct / ex.total : null;
    const mistakes = raw.mistakesByTopic[id] ?? 0;
    const reviewMisses = raw.reviewMisses[id] ?? 0;
    const flags = raw.flagsByTopic[id] ?? 0;
    const struggles = raw.strugglesByTopic[id] ?? 0;
    const ease = raw.easeByTopic[id] ?? null;

    const touched =
      completed ||
      (ex && ex.total > 0) ||
      ease != null ||
      mistakes > 0 ||
      flags > 0 ||
      struggles > 0 ||
      reviewMisses > 0;

    const strongNeg =
      (ratio != null && ratio < EXAM_STRONG) ||
      reviewMisses >= 1 ||
      mistakes >= 2 ||
      flags >= 1 ||
      struggles >= 1 ||
      (ease != null && ease <= EASE_STRONG);

    const mildNeg =
      (ratio != null && ratio < EXAM_MILD) ||
      mistakes >= 1 ||
      (ease != null && ease <= EASE_MILD);

    let state: TopicState;
    if (!touched) state = "untouched";
    else if (strongNeg) state = "needs-reinforcement";
    else if (mildNeg) state = "shaky";
    else state = "solid";

    // Positive proof of mastery: a strong exam ratio, or a flashcard the deck
    // has stopped resurfacing (high, settled ease). A checkmark alone is not it.
    const strongPositive =
      (ratio != null && ratio >= EXAM_MILD) || (ease != null && ease >= 2.5);

    let mastery: Mastery;
    if (!touched) mastery = "not-started";
    else if (strongNeg) mastery = "needs-reinforcement";
    else if (!completed) mastery = "started";
    else if (state === "solid" && strongPositive) mastery = "mastered";
    else mastery = "completed";

    // A concern score just for ranking the weak list — the loudest signals
    // weigh most. Not shown to the student.
    const concern =
      (ratio != null ? (1 - ratio) * 40 : 0) +
      reviewMisses * 18 +
      mistakes * 10 +
      flags * 14 +
      struggles * 16 +
      (ease != null ? Math.max(0, (2.3 - ease)) * 20 : 0);

    const masteryPct =
      ratio != null
        ? Math.round(ratio * 100)
        : state === "untouched"
          ? null
          : state === "solid"
            ? 85
            : state === "shaky"
              ? 55
              : 32;

    byTopic[id] = {
      topicId: id,
      title: t.title,
      unit: t.unit ?? 0,
      completed,
      exam: { correct: ex?.correct ?? 0, total: ex?.total ?? 0, ratio },
      mistakes,
      reviewMisses,
      flags,
      struggles,
      ease,
      state,
      mastery,
      reason: reasonFor({ ratio, reviewMisses, mistakes, flags, struggles, ease, state }),
      masteryPct,
      concern,
    };
  }

  const weak = Object.values(byTopic)
    .filter((s) => s.state === "needs-reinforcement" || s.state === "shaky")
    .sort((a, b) => b.concern - a.concern);

  return { byTopic, weak };
}

function reasonFor(s: {
  ratio: number | null;
  reviewMisses: number;
  mistakes: number;
  flags: number;
  struggles: number;
  ease: number | null;
  state: TopicState;
}): string {
  if (s.state === "untouched") return "Not started yet.";
  if (s.state === "solid") return "Looking solid — nothing wobbling here.";
  // Name the single loudest signal so the message is specific, not a list.
  if (s.struggles >= 1) return "You needed help with this during a lesson.";
  if (s.flags >= 1) return "You flagged this one yourself.";
  if (s.reviewMisses >= 1) return "You missed this in a review.";
  if (s.ratio != null && s.ratio < EXAM_STRONG)
    return `Only ${Math.round(s.ratio * 100)}% right in exams so far.`;
  if (s.mistakes >= 2) return `${s.mistakes} wrong answers on this topic.`;
  if (s.ratio != null && s.ratio < EXAM_MILD)
    return `${Math.round(s.ratio * 100)}% in exams — nearly there.`;
  if (s.ease != null && s.ease <= EASE_STRONG)
    return "The flashcard deck keeps bringing this back.";
  if (s.mistakes >= 1) return "A wrong answer or two on this topic.";
  return "Worth another pass.";
}

/** Load every raw signal for a course and derive the per-topic verdicts. One
 *  call the ladder and Practice hub can both use. */
export async function loadCourseSignals(
  uid: string,
  courseId: string,
  topics: { id: string; title: string; unit?: number }[]
): Promise<CourseSignals> {
  const [progress, examPerTopic, mistakes, flags, practice, struggles] =
    await Promise.all([
      loadProgress(uid, courseId),
      loadExamPerTopic(uid, courseId),
      loadMistakes(uid, courseId),
      loadFlags(uid, courseId),
      loadPracticeState(uid, courseId),
      loadStruggleNotes(uid, courseId),
    ]);

  const mistakesByTopic: Record<string, number> = {};
  for (const m of Object.values(mistakes)) {
    mistakesByTopic[m.topicId] = (mistakesByTopic[m.topicId] ?? 0) + (m.count ?? 1);
  }

  const flagsByTopic: Record<string, number> = {};
  for (const f of Object.values(flags)) {
    if (f.topicId) flagsByTopic[f.topicId] = (flagsByTopic[f.topicId] ?? 0) + 1;
  }

  const strugglesByTopic: Record<string, number> = {};
  for (const [topicId, s] of Object.entries(struggles)) {
    strugglesByTopic[topicId] = s.unresolved > 0 ? s.unresolved : 0;
  }

  const easeByTopic: Record<string, number> = {};
  for (const [id, c] of Object.entries(practice.cards)) {
    if (c.reps > 0) easeByTopic[id] = c.ease;
  }

  return deriveTopicSignals(topics, {
    completed: progress.completed,
    reviewMisses: progress.reviewMisses,
    examPerTopic,
    mistakesByTopic,
    flagsByTopic,
    strugglesByTopic,
    easeByTopic,
  });
}
