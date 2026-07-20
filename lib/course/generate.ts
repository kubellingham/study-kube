// Server-side: digest one unit's raw material into Kube course structure via
// the Claude API. This is the §3 concept-map extraction, done by the model:
// tutor-sized topics with weights and dependencies, gentle checks with
// specific praise, recap lines, and an exam bank with hints + explanations.
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAnthropic, MODEL } from "@/lib/anthropic";
import type { Section, Topic, Step, ExamQuestion } from "./types";

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
      ? `Topics already on this course's ladder (you may list their ids as dependencies):\n${existingTopics
          .map((t) => `- ${t.id}: ${t.title}`)
          .join("\n")}`
      : "This is the first unit — the ladder is empty so far.";

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
      if (s.kind === "teach" && s.body) {
        steps.push({ kind: "teach", title: s.title, body: s.body, code: s.code });
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
          code: s.code,
          options: s.options,
          answer: s.answer,
          praise: s.praise || "That's exactly the idea — locked in.",
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
      code: q.code,
      options: q.options,
      answer: q.answer,
      hint: q.hint,
      explanation: q.explanation,
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
