// Builds a validated CourseBundle from authored course data. Each course
// (CSE22D today, more later) gets its own bundle with the single merged
// ladder and all lookup helpers scoped to that course.
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
    availableUnits: [...new Set(ladder.map((t) => t.unit))].sort((a, b) => a - b),
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
