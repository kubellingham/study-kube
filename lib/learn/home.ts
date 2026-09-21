"use client";

// The /learn "command deck" view-model. Everything the home dashboard shows
// above the subject grid is a CROSS-COURSE roll-up — today's goal, this week's
// pace, reviews ripe across subjects, the soonest exam, the one thing to pick
// up next. Those don't live on any single course, so this module folds the
// already-loaded per-course data into one HomeView.
//
// Pure and side-effect free: the page loads the data (progress, plan, practice
// state, rhythm), hands it here, and renders what comes back. That keeps the
// dashboard's arithmetic testable and out of the component.
import { dailyPlan, daysUntil } from "@/lib/learn/scheduler";

const DAY = 86_400_000;

/** One course, enriched with everything the roll-ups need. */
export interface HomeCourse {
  id: string;
  code: string;
  title: string;
  sections: number;
  topics: number;
  climbed: number;
  crew?: boolean;
  /** How the subject is laid out — "path" (ladder) or "map" (topic clusters). */
  mode?: "path" | "map";
  semester: number | null;
  /** Exam/CA date for this course (ms epoch), or null if unset. */
  examAt: number | null;
  /** topicId -> ms when climbed. Powers today/this-week counts. */
  completedAt: Record<string, number>;
  /** Completed topic ids that sit on the ladder. */
  completedIds: string[];
  /** Practice cards ripe for recall right now. */
  dueReviews: number;
  /** Most recent activity on this course (ms), or null. */
  lastActivityTs: number | null;
}

export type Tone = "tl" | "am" | "rd" | "";

export interface ExamChip {
  label: string;
  tone: Tone;
}

export interface SoonestExam {
  courseId: string;
  code: string;
  title: string;
  examAt: number;
  daysLeft: number;
  tone: Tone;
}

export interface ResumeCard {
  courseId: string;
  code: string;
  title: string;
  /** "CSE46D · Section 4" style meta. */
  meta: string;
  /** "2h ago" / "not started". */
  lastLabel: string;
  /** True when the course hasn't been started — CTA becomes "Start". */
  fresh: boolean;
}

export interface WeekView {
  /** Mon…Sun counts of topics climbed this calendar week. */
  days: number[];
  /** Total climbed this week. */
  total: number;
  /** Total climbed in the previous 7-day week. */
  lastWeekTotal: number;
  /** The week's target (daily goal × 7). */
  goal: number;
}

export interface ReviewsView {
  total: number;
  subjects: number;
  perCourse: { code: string; count: number }[];
}

export interface GoalView {
  target: number;
  doneToday: number;
}

export interface HomeView {
  goal: GoalView;
  week: WeekView;
  reviews: ReviewsView;
  soonestExam: SoonestExam | null;
  resume: ResumeCard | null;
  /** Count of "things worth moving today" — for the greeting line. */
  todayCount: number;
}

function startOfToday(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Midnight on the Monday of the week containing `now`. */
function startOfWeek(now: number): number {
  const d = new Date(startOfToday(now));
  const dow = (d.getDay() + 6) % 7; // 0 = Monday
  return d.getTime() - dow * DAY;
}

/** Tone for an exam chip by how close it is. */
export function examTone(daysLeft: number): Tone {
  if (daysLeft <= 7) return "rd";
  if (daysLeft <= 21) return "am";
  return "tl";
}

/**
 * The small chip on a subject card: "complete", "6d exam", "exam passed",
 * or null when there's no date and nothing to say.
 */
export function examChip(
  examAt: number | null,
  climbed: number,
  topics: number,
  now: number
): ExamChip | null {
  if (topics > 0 && climbed >= topics) return { label: "complete", tone: "tl" };
  if (examAt) {
    const daysLeft = daysUntil(examAt, now);
    if (daysLeft < 0) return { label: "exam passed", tone: "" };
    if (daysLeft === 0) return { label: "exam today", tone: "rd" };
    return { label: `${daysLeft}d exam`, tone: examTone(daysLeft) };
  }
  return null;
}

/** "2h ago" / "3d ago" / "2w ago" / "1mo ago" / "just now". */
export function relativeLabel(ts: number | null, now: number): string {
  if (!ts) return "not started";
  const diff = Math.max(0, now - ts);
  if (diff < 60 * 60 * 1000) {
    const m = Math.round(diff / (60 * 1000));
    return m <= 1 ? "just now" : `${m}m ago`;
  }
  if (diff < DAY) return `${Math.round(diff / (60 * 60 * 1000))}h ago`;
  if (diff < 7 * DAY) return `${Math.round(diff / DAY)}d ago`;
  if (diff < 30 * DAY) return `${Math.round(diff / (7 * DAY))}w ago`;
  const months = Math.round(diff / (30 * DAY));
  return months <= 1 ? "1mo ago" : `${months}mo ago`;
}

/** Time-of-day greeting, plain and human. */
export function greeting(now: number): string {
  const h = new Date(now).getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** "Wednesday, 18 Sep" — the date line under the greeting. */
export function dateLabel(now: number): string {
  return new Date(now).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

/**
 * The one course to pick up next. In-progress courses win (you've started, so
 * finish), tie-broken by soonest exam, then most recent activity. Failing that,
 * the not-yet-complete course with the soonest exam; failing that, the most
 * recently touched. Completed courses never surface here.
 */
function pickResume(courses: HomeCourse[], now: number): ResumeCard | null {
  const live = courses.filter((c) => c.topics > 0 && c.climbed < c.topics);
  if (live.length === 0) return null;

  const score = (c: HomeCourse) => {
    const started = c.climbed > 0 ? 0 : 1; // started first
    const exam = c.examAt ? daysUntil(c.examAt, now) : 9_999; // sooner first
    const recency = c.lastActivityTs ? -c.lastActivityTs : 0; // newer first
    return [started, exam, recency] as const;
  };
  const best = [...live].sort((a, b) => {
    const [sa, ea, ra] = score(a);
    const [sb, eb, rb] = score(b);
    return sa - sb || ea - eb || ra - rb;
  })[0];

  const fresh = best.climbed === 0;
  return {
    courseId: best.id,
    code: best.code,
    title: best.title,
    meta: `${best.code} · ${best.sections} section${best.sections === 1 ? "" : "s"}`,
    lastLabel: relativeLabel(best.lastActivityTs, now),
    fresh,
  };
}

/**
 * Fold the enriched courses into the command-deck view-model. Pass the courses
 * you want counted (typically the current semester's, or all when unfiled) —
 * the roll-ups reflect exactly that set.
 */
export function buildHomeView(courses: HomeCourse[], now: number): HomeView {
  const sot = startOfToday(now);
  const sow = startOfWeek(now);
  const prevWeekStart = sow - 7 * DAY;

  // --- today's goal: sum of each course's on-pace target, done since midnight
  let target = 0;
  let doneToday = 0;
  for (const c of courses) {
    const plan = dailyPlan({
      total: c.topics,
      completedIds: c.completedIds,
      completedAt: c.completedAt,
      examAt: c.examAt,
      now,
    });
    target += plan.target;
    doneToday += plan.doneToday;
  }
  // No exam anywhere → no computed pace. Offer a gentle default so the ring
  // still means something, but never less than what's already done today.
  if (target === 0) target = Math.max(3, doneToday);

  // --- this week's bars + last week's total, from every completion stamp
  const days = new Array(7).fill(0) as number[];
  let lastWeekTotal = 0;
  for (const c of courses) {
    for (const ts of Object.values(c.completedAt)) {
      if (ts >= sow) {
        const idx = Math.floor((ts - sow) / DAY);
        if (idx >= 0 && idx < 7) days[idx] += 1;
      } else if (ts >= prevWeekStart) {
        lastWeekTotal += 1;
      }
    }
  }
  const weekTotal = days.reduce((a, b) => a + b, 0);

  // --- reviews ripe across subjects
  const perCourse = courses
    .filter((c) => c.dueReviews > 0)
    .map((c) => ({ code: c.code, count: c.dueReviews }))
    .sort((a, b) => b.count - a.count);
  const reviewsTotal = perCourse.reduce((n, c) => n + c.count, 0);

  // --- soonest upcoming exam (today or later)
  let soonestExam: SoonestExam | null = null;
  for (const c of courses) {
    if (!c.examAt) continue;
    if (c.topics > 0 && c.climbed >= c.topics) continue; // done — not pressing
    const daysLeft = daysUntil(c.examAt, now);
    if (daysLeft < 0) continue;
    if (!soonestExam || c.examAt < soonestExam.examAt) {
      soonestExam = {
        courseId: c.id,
        code: c.code,
        title: c.title,
        examAt: c.examAt,
        daysLeft,
        tone: examTone(daysLeft),
      };
    }
  }

  const resume = pickResume(courses, now);

  const todayCount =
    (resume ? 1 : 0) + (soonestExam ? 1 : 0) + (reviewsTotal > 0 ? 1 : 0);

  void sot; // startOfToday reserved for future "since midnight" reads
  return {
    goal: { target, doneToday },
    week: { days, total: weekTotal, lastWeekTotal, goal: target * 7 },
    reviews: { total: reviewsTotal, subjects: perCourse.length, perCourse },
    soonestExam,
    resume,
    todayCount,
  };
}
