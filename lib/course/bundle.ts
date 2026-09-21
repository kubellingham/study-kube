// Builds a validated CourseBundle from authored course data. Each course
// (CSE22D today, more later) gets its own bundle with the single merged
// ladder and all lookup helpers scoped to that course.
import { EXTRAS_UNIT } from "./types";
import type { Course, Topic, ExamQuestion, Section } from "./types";

export interface CourseBundle {
  course: Course;
  /** The single ladder: every topic across all sections, in learning order. */
  ladder: Topic[];
  examBank: ExamQuestion[];
  /** Units that have content in this course. */
  availableUnits: number[];
  getTopic(id: string): Topic | undefined;
  topicPosition(id: string): number;
  sectionOfTopic(id: string): Section | undefined;
  questionsForUnit(unit: number | "all"): ExamQuestion[];
  questionsForTopics(topicIds: string[]): ExamQuestion[];
}

export function buildCourseBundle(
  course: Course,
  examBank: ExamQuestion[]
): CourseBundle {
  const ladder = course.sections.flatMap((s) => s.topics);
  const topicIndex = new Map(ladder.map((t, i) => [t.id, i]));

  // Dependency sanity: every dep must appear EARLIER in the ladder. Throwing
  // at module load makes a mis-ordered edit fail the build instead of shipping.
  for (const t of ladder) {
    for (const dep of t.deps) {
      const di = topicIndex.get(dep);
      if (di === undefined) {
        throw new Error(
          `[${course.code}] Topic "${t.id}" depends on unknown topic "${dep}"`
        );
      }
      if (di >= topicIndex.get(t.id)!) {
        throw new Error(
          `[${course.code}] Topic "${t.id}" depends on "${dep}" which comes later in the ladder`
        );
      }
    }
  }
  for (const q of examBank) {
    if (!topicIndex.has(q.topicId)) {
      throw new Error(
        `[${course.code}] Exam question "${q.id}" references unknown topic "${q.topicId}"`
      );
    }
  }

  return {
    course,
    ladder,
    examBank,
    // Extras isn't a unit — you can't "test out" of a bay of stray material.
    availableUnits: [...new Set(ladder.map((t) => t.unit))]
      .filter((u) => u !== EXTRAS_UNIT)
      .sort((a, b) => a - b),
    getTopic: (id) => ladder[topicIndex.get(id) ?? -1],
    topicPosition: (id) => topicIndex.get(id) ?? -1,
    sectionOfTopic: (id) =>
      course.sections.find((s) => s.topics.some((t) => t.id === id)),
    questionsForUnit: (unit) =>
      unit === "all" ? examBank : examBank.filter((q) => q.unit === unit),
    questionsForTopics: (topicIds) => {
      const set = new Set(topicIds);
      return examBank.filter((q) => set.has(q.topicId));
    },
  };
}

/**
 * Make a STORED course safe to build, whatever state it got into.
 *
 * buildCourseBundle is deliberately strict: it throws so an authoring mistake
 * in a built-in course fails the build instead of shipping. Stored courses are
 * different — they are assembled incrementally by the digester, across many
 * files and versions, and a single structural flaw must never cost a student
 * their whole subject (it used to surface as "That course isn't in Kube yet",
 * which is both wrong and unrecoverable).
 *
 * So: repair rather than reject. Drops duplicate topic ids (a unit fed twice
 * used to produce two identical review nodes), dependencies that point at an
 * unknown or later topic, and exam questions orphaned from their topic. Never
 * throws.
 */
export function sanitizeCourse(
  rawSections: unknown,
  rawExamBank: unknown
): { sections: Section[]; examBank: ExamQuestion[] } {
  const sections = Array.isArray(rawSections) ? (rawSections as Section[]) : [];
  const examBank = Array.isArray(rawExamBank) ? (rawExamBank as ExamQuestion[]) : [];

  // Pass 1 — keep the first topic under each id, in ladder order.
  const seen = new Set<string>();
  const cleaned: Section[] = [];
  for (const s of sections) {
    if (!s || typeof s !== "object") continue;
    const topics = (Array.isArray(s.topics) ? s.topics : []).filter((t) => {
      if (!t || typeof t.id !== "string" || seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
    cleaned.push({ ...s, topics });
  }

  // Pass 2 — a dependency may only point at a topic EARLIER in the ladder.
  const position = new Map<string, number>();
  cleaned.flatMap((s) => s.topics).forEach((t, i) => position.set(t.id, i));
  let i = 0;
  for (const s of cleaned) {
    s.topics = s.topics.map((t) => {
      const here = i++;
      const deps = (Array.isArray(t.deps) ? t.deps : []).filter((d) => {
        const at = position.get(d);
        return at !== undefined && at < here;
      });
      return { ...t, deps };
    });
  }

  // Pass 3 — drop questions whose topic is gone, and duplicate question ids.
  const usedQuestionIds = new Set<string>();
  const questions = examBank.filter((q) => {
    if (!q || typeof q.topicId !== "string" || !position.has(q.topicId)) return false;
    const id = typeof q.id === "string" ? q.id : "";
    if (id && usedQuestionIds.has(id)) return false;
    if (id) usedQuestionIds.add(id);
    return true;
  });

  return { sections: cleaned, examBank: questions };
}
