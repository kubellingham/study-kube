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
  /** Course Outcome tag from a past paper, e.g. "CO3". */
  co?: string | null;
  /** Bloom's / RBT level from a past paper, e.g. "L2". */
  level?: string | null;
  /** Where the question came from. */
  source?: "generated" | "pastpaper";
}

/* ---- Intake flow (KUBE_INTAKE_FLOW.md) ---- */

/** Parsed from the driving file (syllabus): the course skeleton. */
export interface SyllabusInfo {
  units: { unit: number; title: string }[];
  cos: { id: string; text: string }[];
}

/** Durable per-file memory — the "quiet receipt". One record per ingested
 *  file; its id is a content hash so the same file is never re-processed. */
export interface IngestedFile {
  id: string; // sha256 prefix of the extracted text
  name: string;
  kind: "syllabus" | "unit" | "pastpaper" | "notes";
  unit: number | null;
  label: string; // human line, e.g. "Unit 3 — Stack Organization"
  topics: number;
  questions: number;
  digestedAt: number;
}
