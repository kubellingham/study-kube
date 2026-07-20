// Server-side: digest one unit's raw material into Kube course structure via
// the Claude API. This is the §3 concept-map extraction, done by the model:
// tutor-sized topics with weights and dependencies, gentle checks with
// specific praise, recap lines, and an exam bank with hints + explanations.
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAnthropic, MODEL } from "@/lib/anthropic";
import type { Section, Topic, Step, ExamQuestion, SyllabusInfo } from "./types";

// Steps are flattened (teach fields + check fields all optional) because a
// single object schema is far more reliable for structured output than a
// discriminated union; we validate the union shape ourselves afterwards.
const stepSchema = z.object({
  kind: z.enum(["teach", "check"]).describe("teach = explain; check = gentle MCQ"),
  title: z.string().optional().describe("teach only: short heading"),
  body: z
    .string()
    .optional()
    .describe(
      "teach only: 1-3 short paragraphs (blank line between). Use **bold** for key terms and `backticks` for code words."
    ),
  code: z.string().optional().describe("optional code block, real C, short"),
  prompt: z.string().optional().describe("check only: the question"),
  options: z.array(z.string()).optional().describe("check only: 3-4 options"),
  answer: z.number().int().optional().describe("check only: index of correct option"),
  praise: z
    .string()
    .optional()
    .describe(
      "check only: warm SPECIFIC praise tied to the idea just tested — never a generic 'Correct!'"
    ),
});

const unitSchema = z.object({
  sectionTitle: z
    .string()
    .describe("Short section name for this unit, e.g. 'Control Flow'"),
  tagline: z.string().describe("One calm line under the section header"),
  topics: z
    .array(
      z.object({
        id: z
          .string()
          .describe("kebab-case id, unique, prefixed with the unit, e.g. 'u3-recursion'"),
        title: z.string(),
        weight: z
          .enum(["heavy", "medium", "light"])
          .describe(
            "How examinable/load-bearing this concept is. Weight inherits upward: a foundation a heavy topic depends on is itself heavy."
          ),
        deps: z
          .array(z.string())
          .describe(
            "Topic ids that must be understood FIRST. May reference earlier topics of this unit or the existing-topic ids provided."
          ),
        whyItMatters: z.string().describe("One line: why this topic matters for the exam"),
        recap: z
          .array(z.string())
          .describe("3-5 key fact lines for quick review / glossary"),
        steps: z.array(stepSchema).describe("2-4 teach steps interleaved with 2-3 checks"),
      })
    )
    .describe("3-6 tutor-sized topics, in dependency order"),
  examQuestions: z
    .array(
      z.object({
        topicId: z.string().describe("id of one of the topics above"),
        prompt: z.string(),
        code: z.string().optional(),
        options: z.array(z.string()).describe("exactly 4 options"),
        answer: z.number().int().describe("index of the correct option"),
        hint: z
          .string()
          .describe("open-mode hint: nudges toward the idea WITHOUT giving the answer"),
        explanation: z.string().describe("why the right answer is right"),
      })
    )
    .describe("8-10 exam questions spread across the topics, tagged by topicId"),
});

export type GeneratedUnit = z.infer<typeof unitSchema>;

const SYSTEM = `You are Kube, a calm and warm tutor who turns a lecturer's unit material into a playable learning ladder.

You do NOT summarize. You extract a plannable concept map and teaching sequence:
- Break the unit into 3-6 tutor-sized topics (one sitting each), ordered by dependency — a real idea like "Finiteness of an algorithm", never "Slide 9".
- Weight each topic heavy/medium/light by how much the material dwells on it and how examinable it looks. Weight inherits upward through dependencies.
- Teach for UNDERSTANDING: teach steps explain the why, not just the what. Prefer why-questions over recall.
- Checks are gentle multiple-choice: plausible distractors drawn from real misconceptions. The praise line must be specific to the idea ("Right — entry-controlled means the gate is checked before you're let in"), never generic.
- Recap lines are crisp facts a student can re-read the night before the exam.
- Exam questions test the unit honestly: mix definition, why, and predict-the-output styles. Hints nudge without revealing. Explanations teach.
- Ground EVERYTHING strictly in the provided material — the exam tests the lecturer's framing, not the internet's. Do not invent topics the material doesn't cover.
- Base your language on the material's own terminology and examples wherever possible.`;

const MAX_UNIT_CHARS = 60_000;

export interface ExistingTopicRef {
  id: string;
  title: string;
}

/** Returns the SDK message stream generating one unit's structure. */
export function generateUnitStream(
  courseTitle: string,
  unitNumber: number,
  rawText: string,
  existingTopics: ExistingTopicRef[]
) {
  const client = getAnthropic();
  const existing =
    existingTopics.length > 0
      ? `Topics already on this course's ladder (you may list their ids as dependencies — and do NOT recreate any of them; produce only topics genuinely new in this material):\n${existingTopics
          .map((t) => `- ${t.id}: ${t.title}`)
          .join("\n")}`
      : "This is the first material — the ladder is empty so far.";

  return client.messages.stream({
    model: MODEL,
    max_tokens: 24000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: zodOutputFormat(unitSchema),
    },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Course: ${courseTitle}\nUnit number: ${unitNumber}\nPrefix all topic ids with "u${unitNumber}-".\n\n${existing}\n\n--- UNIT MATERIAL ---\n${rawText.slice(
          0,
          MAX_UNIT_CHARS
        )}`,
      },
    ],
  });
}

export function parseGeneratedUnit(jsonText: string): GeneratedUnit {
  return unitSchema.parse(JSON.parse(jsonText));
}

/** Convert + sanitize a generated unit into a Section and exam questions that
 *  are guaranteed valid against the existing ladder (deps only point at known
 *  earlier topics, answers in range, questions tagged to real topics). */
export function assembleUnit(
  generated: GeneratedUnit,
  unitNumber: number,
  existingTopicIds: string[]
): { section: Section; questions: ExamQuestion[] } {
  const known = new Set(existingTopicIds);
  const topics: Topic[] = [];

  for (const t of generated.topics) {
    let id = t.id;
    if (known.has(id)) id = `u${unitNumber}-${id}`.slice(0, 80);
    if (known.has(id)) continue; // still colliding — drop rather than corrupt
    const steps: Step[] = [];
    for (const s of t.steps) {
      // Optional fields are added only when present — Firestore rejects
      // undefined values, so absent must mean absent.
      if (s.kind === "teach" && s.body) {
        steps.push({
          kind: "teach",
          body: s.body,
          ...(s.title ? { title: s.title } : {}),
          ...(s.code ? { code: s.code } : {}),
        });
      } else if (
        s.kind === "check" &&
        s.prompt &&
        s.options &&
        s.options.length >= 2 &&
        s.answer !== undefined &&
        s.answer >= 0 &&
        s.answer < s.options.length
      ) {
        steps.push({
          kind: "check",
          prompt: s.prompt,
          options: s.options,
          answer: s.answer,
          praise: s.praise || "That's exactly the idea — locked in.",
          ...(s.code ? { code: s.code } : {}),
        });
      }
    }
    if (steps.length === 0) continue;
    topics.push({
      id,
      title: t.title,
      unit: unitNumber,
      weight: t.weight,
      deps: t.deps.filter((d) => known.has(d)),
      whyItMatters: t.whyItMatters,
      recap: t.recap.slice(0, 6),
      steps,
    });
    known.add(id);
  }

  const topicIds = new Set(topics.map((t) => t.id));
  const questions: ExamQuestion[] = generated.examQuestions
    .filter(
      (q) =>
        topicIds.has(q.topicId) &&
        q.options.length >= 2 &&
        q.answer >= 0 &&
        q.answer < q.options.length
    )
    .map((q, i) => ({
      id: `u${unitNumber}q${i + 1}`,
      topicId: q.topicId,
      unit: unitNumber,
      prompt: q.prompt,
      options: q.options,
      answer: q.answer,
      hint: q.hint,
      explanation: q.explanation,
      ...(q.code ? { code: q.code } : {}),
    }));

  return {
    section: {
      id: `sec-u${unitNumber}`,
      letter: "?", // reassigned when merged into the course
      title: generated.sectionTitle,
      tagline: generated.tagline,
      unit: unitNumber,
      topics,
    },
    questions,
  };
}

/* ---- Silent auto-sort (KUBE_INTAKE_FLOW.md): every file's role is figured
   out by Kube, never filed by hand. ---- */

const classifySchema = z.object({
  kind: z
    .enum(["syllabus", "unit", "pastpaper", "notes"])
    .describe(
      "syllabus = course outline/curriculum defining units and Course Outcomes; unit = teaching material for one unit; pastpaper = an exam/question paper; notes = supplementary handout/notes"
    ),
  unit: z
    .number()
    .int()
    .nullable()
    .describe("The unit number this material teaches, if stated or inferable; else null"),
  label: z
    .string()
    .describe(
      "Short human label for the receipt, e.g. 'Unit 3 — Stack Organization' or 'End-term past paper (CO-tagged)'"
    ),
});

export type Classification = z.infer<typeof classifySchema>;

export function classifyStream(courseTitle: string, rawText: string) {
  const client = getAnthropic();
  return client.messages.stream({
    model: MODEL,
    max_tokens: 2000,
    output_config: { effort: "low", format: zodOutputFormat(classifySchema) },
    system:
      "Classify what role a file plays in a university course. A syllabus/course outline is the driving file (defines units + Course Outcomes, usually with little teaching content). Past papers are exam/question papers. Lecture slide decks and teaching documents are 'unit' — even when they cover only PART of a unit (e.g. a single lecture); infer the unit number from the title or content. Reserve 'notes' for supplementary handouts that clearly aren't the main teaching material.",
    messages: [
      {
        role: "user",
        content: `Course: ${courseTitle}\n\n--- FILE CONTENT (start) ---\n${rawText.slice(0, 10_000)}`,
      },
    ],
  });
}

export function parseClassification(jsonText: string): Classification {
  return classifySchema.parse(JSON.parse(jsonText));
}

const syllabusSchema = z.object({
  units: z
    .array(z.object({ unit: z.number().int(), title: z.string() }))
    .describe("Every unit the syllabus defines, in order, with its title"),
  cos: z
    .array(z.object({ id: z.string().describe("e.g. CO1"), text: z.string() }))
    .describe("The Course Outcomes, if listed; empty array if none"),
});

export function syllabusStream(courseTitle: string, rawText: string) {
  const client = getAnthropic();
  return client.messages.stream({
    model: MODEL,
    max_tokens: 6000,
    output_config: { effort: "low", format: zodOutputFormat(syllabusSchema) },
    system:
      "Extract the skeleton of a course from its syllabus/outline: the numbered units with their titles, and the Course Outcomes (COs). Faithful to the document — do not invent units it doesn't define.",
    messages: [
      {
        role: "user",
        content: `Course: ${courseTitle}\n\n--- SYLLABUS ---\n${rawText.slice(0, 40_000)}`,
      },
    ],
  });
}

export function parseSyllabus(jsonText: string): SyllabusInfo {
  return syllabusSchema.parse(JSON.parse(jsonText));
}

const pastPaperSchema = z.object({
  questions: z
    .array(
      z.object({
        topicId: z
          .string()
          .describe("The id of the existing ladder topic this question belongs to (from the provided list)"),
        prompt: z.string(),
        code: z.string().optional(),
        options: z.array(z.string()).describe("exactly 4 options"),
        answer: z.number().int().describe("index of the correct option"),
        hint: z.string().describe("nudges toward the idea WITHOUT giving the answer"),
        explanation: z.string(),
        co: z.string().nullable().describe("Course Outcome tag if printed, e.g. 'CO3'"),
        level: z.string().nullable().describe("Bloom's/RBT level if printed, e.g. 'L2'"),
      })
    )
    .describe("Every usable question from the paper, converted to MCQ form"),
});

export function pastPaperStream(
  courseTitle: string,
  rawText: string,
  existingTopics: ExistingTopicRef[]
) {
  const client = getAnthropic();
  return client.messages.stream({
    model: MODEL,
    max_tokens: 24000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high", format: zodOutputFormat(pastPaperSchema) },
    system:
      "You convert a real past exam paper into Kube assessment questions. Keep each question's substance and difficulty faithful to the paper — these show how the course is actually tested. Convert non-MCQ questions into fair 4-option MCQs testing the same idea. Preserve printed CO and Bloom's/RBT level tags per question (null if absent). Map every question onto the closest topic id from the provided ladder; skip questions that fit no topic.",
    messages: [
      {
        role: "user",
        content: `Course: ${courseTitle}\n\nLadder topics (map each question to one of these ids):\n${existingTopics
          .map((t) => `- ${t.id}: ${t.title}`)
          .join("\n")}\n\n--- PAST PAPER ---\n${rawText.slice(0, MAX_UNIT_CHARS)}`,
      },
    ],
  });
}

export function parsePastPaper(jsonText: string) {
  return pastPaperSchema.parse(JSON.parse(jsonText));
}

/** Sanitize past-paper questions against the ladder and tag their source. */
export function assemblePastPaperQuestions(
  parsed: z.infer<typeof pastPaperSchema>,
  topics: { id: string; unit: number }[],
  fileId: string
): ExamQuestion[] {
  const unitOf = new Map(topics.map((t) => [t.id, t.unit]));
  return parsed.questions
    .filter(
      (q) =>
        unitOf.has(q.topicId) &&
        q.options.length >= 2 &&
        q.answer >= 0 &&
        q.answer < q.options.length
    )
    .map((q, i) => ({
      id: `pp-${fileId}-${i + 1}`,
      topicId: q.topicId,
      unit: unitOf.get(q.topicId)!,
      prompt: q.prompt,
      options: q.options,
      answer: q.answer,
      hint: q.hint,
      explanation: q.explanation,
      co: q.co ?? null,
      level: q.level ?? null,
      source: "pastpaper" as const,
      ...(q.code ? { code: q.code } : {}),
    }));
}

/** Re-letter sections A, B, C… in unit order and drop deps that point at
 *  topics which no longer exist or come later (e.g. after a unit re-digest). */
export function normalizeCourse(sections: Section[]): Section[] {
  const sorted = [...sections].sort((a, b) => a.unit - b.unit);
  const seen = new Set<string>();
  return sorted.map((s, i) => ({
    ...s,
    letter: String.fromCharCode(65 + i),
    topics: s.topics.map((t) => {
      const deps = t.deps.filter((d) => seen.has(d));
      seen.add(t.id);
      return { ...t, deps };
    }),
  }));
}
