// Harvest the vocabulary Kube glossed inline in its lessons. Teach beats mark
// beginner-unfriendly terms as [[term|definition]] (rendered as hover chips in
// the lesson); this pulls every one out of the whole course so they can be
// reviewed on the glossary page too — deduped by term, alphabetized, each
// pointing back to the topic it was taught in.
import type { Course, Step } from "@/lib/course/types";

export interface VocabEntry {
  term: string;
  def: string;
  topicId: string;
  topicTitle: string;
}

const TERM_RE = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;

export function collectVocab(course: Course): VocabEntry[] {
  const seen = new Map<string, VocabEntry>();
  for (const section of course.sections) {
    for (const topic of section.topics) {
      if (topic.kind === "review") continue;
      const steps: Step[] = [
        ...(topic.lessons?.flatMap((l) => l.steps) ?? []),
        ...topic.steps,
      ];
      for (const s of steps) {
        if (s.kind !== "teach" || !s.body) continue;
        TERM_RE.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = TERM_RE.exec(s.body)) !== null) {
          const term = m[1].trim();
          const def = m[2].trim();
          if (!term || !def) continue;
          const key = term.toLowerCase();
          // First definition wins — it's introduced where the term is met.
          if (!seen.has(key)) seen.set(key, { term, def, topicId: topic.id, topicTitle: topic.title });
        }
      }
    }
  }
  return [...seen.values()].sort((a, b) =>
    a.term.localeCompare(b.term, undefined, { sensitivity: "base" })
  );
}
