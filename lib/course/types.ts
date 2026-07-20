// Kube course data model — Course → Sections → Topics → Lessons → Steps.
// Authored statically per unit; the ladder is the dependency-ordered flattening
// of every topic across all units into ONE continuous path (brief §4).

export type Weight = "heavy" | "medium" | "light";

export interface Course {
  id: string;
  code: string; // e.g. "CSE22D"
  title: string;
  sections: Section[];
}

export interface Section {
  id: string;
  letter: string; // "A", "B", ...
  title: string;
  tagline: string; // one calm line under the section header
  unit: number; // source unit number
  topics: Topic[];
}

export interface Topic {
  id: string;
  title: string;
  unit: number;
  weight: Weight;
  /** Topic ids that must be understood first. Must point backwards in ladder order. */
  deps: string[];
  /** One line shown on the analysis screen: why this topic matters. */
  whyItMatters: string;
  /** 3–6 key lines for the quick-review view of a completed node and the glossary. */
  recap: string[];
  steps: Step[];
}

export type Step = TeachStep | CheckStep;

export interface TeachStep {
  kind: "teach";
  /** Short heading over the teach card. */
  title?: string;
  /** Body text. Supports `code` spans and **bold**. Blank line = new paragraph. */
  body: string;
  /** Optional code block rendered in mono below the body. */
  code?: string;
}

export interface CheckStep {
  kind: "check";
  prompt: string;
  code?: string;
  options: string[];
  /** Index into options. */
  answer: number;
  /** Warm, SPECIFIC praise tied to the idea — never a generic "Correct!". */
  praise: string;
}

export interface ExamQuestion {
  id: string;
  topicId: string;
  unit: number;
  prompt: string;
  code?: string;
  options: string[];
  answer: number;
  /** Open mode only: nudges toward the idea without giving the answer. */
  hint: string;
  /** Shown on the analysis screen review. */
  explanation: string;
}
