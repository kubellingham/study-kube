// Assembles the full Kube course. The ladder is ONE continuous dependency-
// ordered path across all units (brief §4) — sections give it structure, but
// topics flatten into a single spine. Authored order already respects deps
// (every dep points to an earlier topic); validated below at module load.
import type { Course, Topic, ExamQuestion, Section } from "./types";
import { sectionA, sectionB, unit1Exam } from "./unit1";
import { sectionC, unit2Exam } from "./unit2";
import { sectionD, unit3Exam } from "./unit3";
import { sectionE, unit4Exam } from "./unit4";

export const course: Course = {
  id: "cse22d",
  code: "CSE22D",
  title: "Computer Programming Using C",
  sections: [sectionA, sectionB, sectionC, sectionD, sectionE],
};

/** The single ladder: every topic across all sections, in learning order. */
export const ladder: Topic[] = course.sections.flatMap((s) => s.topics);

export const examBank: ExamQuestion[] = [
  ...unit1Exam,
  ...unit2Exam,
  ...unit3Exam,
  ...unit4Exam,
];

/** Units that currently have content (Units 5–6 merge in when they arrive). */
export const availableUnits: number[] = [
  ...new Set(ladder.map((t) => t.unit)),
].sort();

const topicIndex = new Map(ladder.map((t, i) => [t.id, i]));

export function getTopic(id: string): Topic | undefined {
  return ladder[topicIndex.get(id) ?? -1];
}

export function topicPosition(id: string): number {
  return topicIndex.get(id) ?? -1;
}

export function sectionOfTopic(id: string): Section | undefined {
  return course.sections.find((s) => s.topics.some((t) => t.id === id));
}

export function questionsForUnit(unit: number | "all"): ExamQuestion[] {
  if (unit === "all") return examBank;
  return examBank.filter((q) => q.unit === unit);
}

export function questionsForTopics(topicIds: string[]): ExamQuestion[] {
  const set = new Set(topicIds);
  return examBank.filter((q) => set.has(q.topicId));
}

// Dependency sanity: every dep must appear EARLIER in the ladder. Throwing at
// module load makes a mis-ordered edit fail the build instead of shipping.
for (const t of ladder) {
  for (const dep of t.deps) {
    const di = topicIndex.get(dep);
    if (di === undefined) {
      throw new Error(`Topic "${t.id}" depends on unknown topic "${dep}"`);
    }
    if (di >= topicIndex.get(t.id)!) {
      throw new Error(`Topic "${t.id}" depends on "${dep}" which comes later in the ladder`);
    }
  }
}
for (const q of examBank) {
  if (!topicIndex.has(q.topicId)) {
    throw new Error(`Exam question "${q.id}" references unknown topic "${q.topicId}"`);
  }
}
