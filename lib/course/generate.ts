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

const lessonSchema = z.object({
  id: z.string().describe("short kebab id unique within the topic, e.g. 'q1'"),
  title: z
    .string()
    .describe(
      "Quarter title, e.g. '1 · Meet it, slowly' / '2 · Question it' / '3 · Again, differently' / '4 · Stretch & compare'"
    ),
  steps: z.array(stepSchema).describe("This quarter's beats (teach) and checks"),
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
        lessons: z
          .array(lessonSchema)
          .describe(
            "The four-quarter drill (2-3 lessons for a light concept, 4 for medium/heavy): Q1 meet-it-slowly (4-8 tiny teach beats that WALK the student into the idea — never the whole definition in one breath), Q2 question-it (gentle checks on exactly what was met), Q3 again-differently (a worked example, a you-try-one check, a spot-the-mistake check), Q4 stretch-and-compare (neighbours, harder cases, transfer)"
          ),
      })
    )
    .describe(
      "ONE CONCEPT PER TOPIC — split dense source slides into separate topics (BCD, Excess-3 and Gray code are three topics, never one). 4-10 topics per document, in dependency order"
    ),
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

const SYSTEM = `You are Kube, a calm and warm tutor who turns a lecturer's unit material into a playable learning ladder of DEEP, drilled circles — genuinely teaching someone who starts knowing nothing.

You do NOT summarize, and you never build "show a card + Got it button" lessons. You extract a concept map and drill each concept:
- ONE CONCEPT PER TOPIC, never cram. If a slide presents three codes together, that is three topics, each drilled independently. The source's density is not the lesson's density.
- Each topic is a FOUR-QUARTER circle (lighter concepts may compress to 2-3 quarters, but never to a single card):
  Q1 "Meet it, slowly" — 4-8 tiny teach beats, each ONE small idea, that WALK the student into the concept (start from a question or a need, build up; never state the full definition in one breath).
  Q2 "Question it" — gentle checks on exactly what was just met, poked from different angles.
  Q3 "Again, differently" — the SAME concept re-approached: a worked example, then a "you try one" check, then a "spot the mistake" check diagnosing a realistic student error.
  Q4 "Stretch & compare" — neighbours, harder cases, transfer to a fresh scenario. Only now compare with related concepts.
- HARD RULE: every repetition must be a FRESH angle (meet / use / break / compare). Never repeat the same question shape within a circle — same-shape reps are where learners quit.
- Depth scales with weight: heavy = the full deep drill (~14-18 interactions); medium = solid (~10); light = lean (~6-8) but STILL a real circle. Light never means skipped.
- Teach for UNDERSTANDING: beats explain the why. Checks use plausible distractors drawn from real misconceptions. Praise lines are specific to the idea just tested ("Right — the +1 is what separates 2's from 1's complement"), never generic.
- Where natural, END a topic by exposing the question the NEXT topic answers (teach forward).
- Recap lines are crisp facts for the night before the exam.
- Exam questions test the unit honestly: mix definition, why, and worked styles. Hints nudge without revealing. Explanations teach.
- HARD RULE: exam-bank questions are the ASSESSMENT pool (reviews and mock exams draw from them) — no exam question may duplicate or lightly reword a check question that appears inside any lesson. A student must never meet the same question twice; write each exam question from an angle the lessons did not use.
- Ground EVERYTHING strictly in the provided material — the exam tests the lecturer's framing, not the internet's. Do not invent topics the material doesn't cover.
- Use the material's own terminology, examples and worked numbers wherever possible.`;

const MAX_UNIT_CHARS = 60_000;

export interface ExistingTopicRef {
  id: string;
  title: string;
}

/** Returns the SDK message stream generating one unit's structure. */
/** Slide pictures / scanned pages / photos that accompany a file's text.
 *  The client compresses them; here they become vision blocks so Kube can
 *  teach from image-carried material (diagrams, image-only slides, scans). */
export interface SourceImage {
  mediaType: string;
  data: string; // bare base64
}

type ContentBlock =
  | { type: "text"; text: string }
  | {
      type: "image";
      source: { type: "base64"; media_type: "image/jpeg" | "image/png"; data: string };
    };

function withImages(text: string, images?: SourceImage[]): string | ContentBlock[] {
  if (!images || images.length === 0) return text;
  const blocks: ContentBlock[] = [{ type: "text", text }];
  for (const img of images) {
    blocks.push({
      type: "image",
      source: {
        type: "base64",
        media_type: img.mediaType === "image/png" ? "image/png" : "image/jpeg",
        data: img.data,
      },
    });
  }
  blocks.push({
    type: "text",
    text: `The ${images.length} image(s) above are part of this material — slides, diagrams or scanned pages whose content is NOT in the text. Read them as carefully as the text; anything they teach must appear in your output.`,
  });
  return blocks;
}

export function generateUnitStream(
  courseTitle: string,
  unitNumber: number,
  rawText: string,
  existingTopics: ExistingTopicRef[],
  images?: SourceImage[]
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
    max_tokens: 48000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: zodOutputFormat(unitSchema),
    },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: withImages(
          `Course: ${courseTitle}\nUnit number: ${unitNumber}\nPrefix all topic ids with "u${unitNumber}-".\n\n${existing}\n\n--- UNIT MATERIAL ---\n${rawText.slice(
            0,
            MAX_UNIT_CHARS
          )}`,
          images
        ),
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

  function sanitizeSteps(raw: z.infer<typeof stepSchema>[]): Step[] {
    const steps: Step[] = [];
    for (const s of raw) {
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
    return steps;
  }

  for (const t of generated.topics) {
    let id = t.id;
    if (known.has(id)) id = `u${unitNumber}-${id}`.slice(0, 80);
    if (known.has(id)) continue; // still colliding — drop rather than corrupt
    const lessons = t.lessons
      .map((l, i) => ({
        id: l.id || `q${i + 1}`,
        title: l.title || `Part ${i + 1}`,
        steps: sanitizeSteps(l.steps),
      }))
      .filter((l) => l.steps.length > 0);
    if (lessons.length === 0) continue;
    topics.push({
      id,
      title: t.title,
      unit: unitNumber,
      weight: t.weight,
      deps: t.deps.filter((d) => known.has(d)),
      whyItMatters: t.whyItMatters,
      recap: t.recap.slice(0, 6),
      lessons,
      steps: [],
    });
    known.add(id);
  }

  // Spaced review, Duolingo-style: every generated unit ends with a
  // compulsory 5-question review node over its heaviest circles.
  if (topics.length >= 2) {
    const reviewed = topics
      .filter((t) => t.weight !== "light")
      .slice(-4)
      .map((t) => t.id);
    const pool = reviewed.length >= 1 ? reviewed : topics.slice(-3).map((t) => t.id);
    topics.push({
      id: `u${unitNumber}-review`,
      title: `Unit ${unitNumber} quick review`,
      unit: unitNumber,
      weight: "light",
      kind: "review",
      review: { topicIds: pool, count: 5 },
      deps: [topics[topics.length - 1].id],
      whyItMatters:
        "Five fresh questions over this unit's heaviest ideas — the rung that makes the climb permanent.",
      recap: [],
      steps: [],
    });
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

export function classifyStream(courseTitle: string, rawText: string, images?: SourceImage[]) {
  const client = getAnthropic();
  return client.messages.stream({
    model: MODEL,
    max_tokens: 2000,
    output_config: { effort: "low", format: zodOutputFormat(classifySchema) },
    system:
      "Classify what role a file plays in a university course. A syllabus/course outline is the driving file (defines units + Course Outcomes, usually with little teaching content). Past papers are exam/question papers. Lecture slide decks and teaching documents are 'unit' — even when they cover only PART of a unit (e.g. a single lecture); infer the unit number from the title or content. Reserve 'notes' for supplementary handouts that clearly aren't the main teaching material. Some files arrive as images (scanned pages, photographed notes, slide pictures) — classify from what the images show.",
    messages: [
      {
        role: "user",
        content: withImages(
          `Course: ${courseTitle}\n\n--- FILE CONTENT (start) ---\n${rawText.slice(0, 10_000)}`,
          images
        ),
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

export function syllabusStream(courseTitle: string, rawText: string, images?: SourceImage[]) {
  const client = getAnthropic();
  return client.messages.stream({
    model: MODEL,
    max_tokens: 6000,
    output_config: { effort: "low", format: zodOutputFormat(syllabusSchema) },
    system:
      "Extract the skeleton of a course from its syllabus/outline: the numbered units with their titles, and the Course Outcomes (COs). Faithful to the document — do not invent units it doesn't define. The syllabus may arrive as scanned page images; read them as the document.",
    messages: [
      {
        role: "user",
        content: withImages(
          `Course: ${courseTitle}\n\n--- SYLLABUS ---\n${rawText.slice(0, 40_000)}`,
          images
        ),
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
  existingTopics: ExistingTopicRef[],
  images?: SourceImage[]
) {
  const client = getAnthropic();
  return client.messages.stream({
    model: MODEL,
    max_tokens: 24000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high", format: zodOutputFormat(pastPaperSchema) },
    system:
      "You convert a real past exam paper into Kube assessment questions. Keep each question's substance and difficulty faithful to the paper — these show how the course is actually tested. Convert non-MCQ questions into fair 4-option MCQs testing the same idea. Preserve printed CO and Bloom's/RBT level tags per question (null if absent). Map every question onto the closest topic id from the provided ladder; skip questions that fit no topic. Papers often arrive as scanned page images — read every page image carefully and convert its questions exactly as if it were text.",
    messages: [
      {
        role: "user",
        content: withImages(
          `Course: ${courseTitle}\n\nLadder topics (map each question to one of these ids):\n${existingTopics
            .map((t) => `- ${t.id}: ${t.title}`)
            .join("\n")}\n\n--- PAST PAPER ---\n${rawText.slice(0, MAX_UNIT_CHARS)}`,
          images
        ),
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
