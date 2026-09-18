"use client";

// The daily plan — the heart of Focus. Given how much of a subject is left and
// how long until the exam, it works out what to cover TODAY to stay on pace,
// and how much of that is already done. Pure; the ladder renders the one warm
// line it returns. This is the feature the $9.99 tier advertised but never had.

const DAY = 86_400_000;

export interface DailyPlan {
  hasExam: boolean;
  examAt: number | null;
  /** Whole days until the exam: 0 = today, negative = past. */
  daysLeft: number | null;
  total: number;
  remaining: number;
  /** Topics to climb today to stay on pace. */
  target: number;
  /** Topics already climbed since midnight. */
  doneToday: number;
  onPace: boolean;
  /** Whole course climbed. */
  done: boolean;
  /** One calm line for the Today card. */
  message: string;
}

function startOfToday(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function daysUntil(examAt: number, now: number): number {
  return Math.ceil((examAt - now) / DAY);
}

export function dailyPlan(opts: {
  total: number;
  completedIds: string[]; // completed topics that are on the ladder
  completedAt: Record<string, number>; // topicId -> ms
  examAt: number | null;
  now: number;
}): DailyPlan {
  const { total, completedIds, completedAt, examAt, now } = opts;
  const remaining = Math.max(0, total - completedIds.length);
  const sot = startOfToday(now);
  const doneToday = completedIds.filter((id) => (completedAt[id] ?? 0) >= sot).length;
  const courseDone = total > 0 && remaining === 0;

  if (!examAt) {
    return {
      hasExam: false, examAt: null, daysLeft: null, total, remaining,
      target: 0, doneToday, onPace: true, done: courseDone,
      message: courseDone
        ? "Whole course climbed. Add an exam date to plan your reviews."
        : "Add your exam date and Kube maps out what to climb each day.",
    };
  }

  const daysLeft = daysUntil(examAt, now);

  if (courseDone) {
    return {
      hasExam: true, examAt, daysLeft, total, remaining,
      target: 0, doneToday, onPace: true, done: true,
      message:
        daysLeft >= 0
          ? `Whole course climbed with ${daysLeft} day${daysLeft === 1 ? "" : "s"} to spare — keep it warm with reviews.`
          : "Whole course climbed.",
    };
  }

  // Today still counts, so spread what's left over the days remaining (min 1).
  const daysAvail = Math.max(1, daysLeft);
  const target = Math.max(1, Math.ceil(remaining / daysAvail));
  const onPace = doneToday >= target;
  const leftToday = Math.max(0, target - doneToday);

  let message: string;
  if (daysLeft < 0) {
    message = `Exam's passed — ${remaining} topic${remaining === 1 ? "" : "s"} still open if you're catching up.`;
  } else if (daysLeft === 0) {
    message = `Exam today — ${remaining} topic${remaining === 1 ? "" : "s"} left. Climb what you can.`;
  } else if (onPace) {
    message = `On pace — ${doneToday} done today, ${daysLeft} day${daysLeft === 1 ? "" : "s"} to the exam.`;
  } else {
    message = `Climb ${leftToday} more today to stay on pace — ${daysLeft} day${daysLeft === 1 ? "" : "s"} to go.`;
  }

  return { hasExam: true, examAt, daysLeft, total, remaining, target, doneToday, onPace, done: false, message };
}
