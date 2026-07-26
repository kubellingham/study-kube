// Server-side: digest one unit's raw material into Kube course structure via
// the Claude API. This is the §3 concept-map extraction, done by the model:
// tutor-sized topics with weights and dependencies, gentle checks with
// specific praise, recap lines, and an exam bank with hints + explanations.
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAnthropic, MODEL } from "@/lib/anthropic";
import type { UsageMeter } from "@/lib/usage";
import { chatJSON, orImageBlocks, CLIMB_MODEL, CLIMB_VISION_MODEL, SUMMIT_MODEL, SUMMIT_VISION_MODEL } from "@/lib/openrouter";
import { sanitizeSvg } from "./svg";
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
      "teach only: 1-3 short paragraphs (blank line between). Use **bold** for key terms and `backticks` for code words. Gloss a term a beginner might not know on its FIRST use as [[term|one-line plain definition]] — e.g. [[VCC|the +5 V power-supply pin]], [[GND|the 0 V reference — ground]]. Gloss jargon and acronyms, never everyday words; at most ~3 per beat."
    ),
  code: z.string().optional().describe("optional code block, real C, short"),
  svg: z
    .string()
    .optional()
    .describe(
      "teach only, OPTIONAL: a small hand-drawn-style SVG diagram when the concept is SPATIAL/VISUAL and a picture genuinely helps — a chip pinout, a logic-gate or circuit wiring, a waveform/timing diagram, a truth-table-driven schematic, a labelled block diagram. Rules: root <svg> with a viewBox (e.g. '0 0 320 200') and NO width/height; stroke=\"currentColor\" and fill=\"none\" for lines so it themes (use fill=\"currentColor\" only for text/dots); label parts with <text> (font-size 11-13); keep it clean and correct (right pin count, right connections) and under ~40 shapes. NO scripts, styles, images, or external refs. Omit entirely for non-visual concepts — most teach beats have no svg."
    ),
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
- HARD RULE — ungameable options (applies to EVERY check and exam question): all options must be PARALLEL in length, specificity and grammar. The correct answer must NEVER be the longest, the most detailed, or the only one written as a full explanation while the distractors are terse throwaways — a student must not be able to pick the answer by feel. Make each distractor a genuine, plausible misconception stated with the same confidence and length as the correct option. Vary which option is correct — do not habitually place it in the same slot.
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

/* ------------------------------------------------------------------ *
 * CHUNKED, PARALLEL GENERATION
 *
 * The single generateUnitStream call above emits the ENTIRE unit — every
 * topic's four quarters plus the exam bank — as one serial token stream of
 * up to 48k tokens. Token generation is serial, so a substantial file blows
 * past the serverless function's time limit and the job hangs.
 *
 * Instead we split the work into small calls that fit any timeout and run
 * concurrently:
 *   1. skeleton   — section header + the topic list (no lessons). Fast.
 *   2. per-topic  — one call generates ONE topic's four-quarter drill.
 *   3. exam bank  — one call writes the assessment questions.
 * Steps 2 and 3 depend only on the skeleton, so they all run in parallel.
 * Each call emits a few thousand tokens, not tens of thousands, so wall-clock
 * is the slowest single call, not the sum of everything.
 * ------------------------------------------------------------------ */

const CONCEPT_RULES = `You are Kube, a calm, warm tutor mapping a lecturer's unit material into a learning ladder.
- ONE CONCEPT PER TOPIC, never cram. If a slide presents three codes together, that is three topics. The source's density is not the lesson's density (BCD, Excess-3 and Gray code are three topics, never one).
- 4-10 topics per document, in dependency order. Weight inherits upward: a foundation a heavy topic depends on is itself heavy.
- Recap lines are crisp, exam-night facts.
- Ground EVERYTHING strictly in the provided material — do not invent topics it doesn't cover. Use the material's own terminology, examples and worked numbers.`;

const DRILL_RULES = `You are Kube, a calm, warm tutor. You drill ONE concept into a FOUR-QUARTER circle — genuinely teaching someone who starts knowing nothing. You never build "show a card + Got it button" lessons.
- QUALITY BAR (teach like the best human tutor): build INTUITION before formalism — open from a concrete question, need or example the student can feel, then name the idea. Every beat must earn its place: no filler, no restating the title, no "as we saw". Prefer ONE vivid worked example shown in full over three vague ones. Each check must actually reveal understanding — its distractors are the real mistakes a learner makes here, and the praise names WHY the right answer is right. Define a term the first time it's used; never assume a leap. If something is genuinely subtle, slow down and add a beat rather than gloss it.
- Q1 "Meet it, slowly" — 4-8 tiny teach beats, each ONE small idea, that WALK the student into the concept (start from a question or a need; never state the full definition in one breath).
- Q2 "Question it" — gentle checks on exactly what was just met, poked from different angles.
- Q3 "Again, differently" — the SAME concept re-approached: a worked example, then a "you try one" check, then a "spot the mistake" check diagnosing a realistic student error.
- Q4 "Stretch & compare" — neighbours, harder cases, transfer to a fresh scenario; only now compare with related concepts.
- Lighter concepts may compress to 2-3 quarters, but NEVER to a single card. Depth scales with weight: heavy = full deep drill (~14-18 interactions); medium ~10; light ~6-8 but still a real circle.
- HARD RULE: every repetition is a FRESH angle (meet / use / break / compare). Never repeat the same question shape within a circle.
- Teach for UNDERSTANDING: beats explain the why; checks use plausible distractors from real misconceptions; praise is specific to the idea just tested ("Right — the +1 is what separates 2's from 1's complement"), never a generic "Correct!".
- WORKED EXAMPLES (Q3 especially): work it end to end with REAL numbers/values — show EVERY step and state the final result. Verify any arithmetic, truth table, bit pattern or conversion before you write it; a wrong worked number teaches the wrong thing. If a computation is one you can't be sure of, teach it qualitatively rather than guess a number.
- DIAGRAMS: when a beat's concept is SPATIAL or VISUAL — a chip pinout, a logic-gate/circuit wiring, a waveform or timing diagram, a labelled block diagram — add a small correct labelled SVG to that teach beat's \`svg\` field (follow the field's rules). A right picture beats a paragraph. Never attach an svg to a non-visual beat, and never let a wrong diagram (miscounted pins, wrong wiring) ship.
- GLOSSARY: assume less than you think. Gloss the FIRST appearance of any term a true beginner wouldn't know as [[term|plain one-line definition]] — acronyms and jargon (VCC, GND, MSB, flip-flop, propagation delay), never everyday words. At most ~3 per beat.
- HARD RULE — ungameable options (EVERY check): all options PARALLEL in length, specificity and grammar. The correct answer is never the longest or the only fully-explained one. Distractors are genuine, plausible misconceptions stated with the same confidence and length. Vary which option is correct.
- Ground everything strictly in the provided material; use its own terminology and worked numbers.`;

const EXAM_RULES = `You are Kube. You write a unit's ASSESSMENT pool — the exam-bank questions that reviews and mock exams draw from.
- Test the unit honestly: mix definition, why, and worked styles, spread across the topics.
- Hints nudge toward the idea WITHOUT revealing the answer. Explanations teach why the right answer is right.
- HARD RULE: no exam question may duplicate or lightly reword a check that appears inside a lesson — write each from an angle the lessons did not use. A student must never meet the same question twice.
- HARD RULE — ungameable options: all four options PARALLEL in length, specificity and grammar. The correct answer is never the longest or the only fully-explained one; distractors are genuine plausible misconceptions, not throwaways. Vary which option is correct — never habitually place it in one slot.
- Ground everything strictly in the provided material; use its own terminology and worked numbers.`;

// ── Teach-from-knowledge variants ─────────────────────────────────────────
// When a student has only a SYLLABUS/OUTLINE (no teaching content), Kube builds
// the ladder from its own solid knowledge of the standard curriculum, using the
// outline for scope. Always surfaced to the student as "standard curriculum —
// add your notes to ground it."
const CONCEPT_RULES_KNOWLEDGE = `You are Kube, a calm, warm tutor. The provided text is a SYLLABUS / OUTLINE (topics, outcomes, a course plan) — NOT teaching content. Build the concept map a student must master to meet these outcomes, drawing on your OWN solid knowledge of the standard university curriculum for this subject.
- ONE CONCEPT PER TOPIC, never cram. 4-12 topics, in dependency order (weight inherits upward).
- You MAY add foundational concepts the outline assumes but doesn't spell out (a student needs them). Do NOT wander beyond the course's scope or invent exotic topics it wouldn't cover.
- Follow the outline's terminology, ordering and emphasis. If the outline signals the assessment style (e.g. a practical/lab exam), weight toward what that exam tests.
- Recap lines are crisp, exam-night facts.`;

const DRILL_RULES_KNOWLEDGE = `You are Kube, a calm, warm tutor. You drill ONE concept into a FOUR-QUARTER circle — genuinely teaching someone who starts knowing nothing. The provided text is only the SYLLABUS/OUTLINE (for scope); TEACH this concept fully and correctly from your OWN solid knowledge of the standard curriculum.
- Q1 "Meet it, slowly" — 4-8 tiny teach beats walking the student in from a question/need; never the full definition in one breath.
- Q2 "Question it" — gentle checks on exactly what was met.
- Q3 "Again, differently" — a real worked example, a "you try one", and a "spot the mistake" on a realistic error. Use real numbers, real truth tables, real IC/pinout details where the subject calls for them. Work every example end to end and VERIFY the arithmetic/truth table/bit pattern before writing it — a wrong worked number teaches the wrong thing.
- Q4 "Stretch & compare" — neighbours, harder cases, transfer; compare related concepts.
- KEEP IT COMPACT — this is a first-pass overview taught from standard curriculum, and the WHOLE ladder must build in one pass: aim for 2-3 quarters and ~7-10 interactions total per topic, with tight beats. Depth comes later when the student adds their own material. Be concise enough that the full lesson finishes well within the token budget — never get cut off mid-lesson.
- Every repetition is a FRESH angle. Teach for UNDERSTANDING (the why), specific praise, plausible-misconception distractors.
- DIAGRAMS: when a beat is SPATIAL/VISUAL (a pinout, a gate/circuit wiring, a waveform, a labelled block diagram), add a small correct labelled SVG to that beat's \`svg\` field (follow the field's rules). A right picture beats a paragraph; never ship a wrong one, and never attach one to a non-visual beat.
- GLOSSARY: gloss the FIRST use of any term a beginner wouldn't know as [[term|plain one-line definition]] — acronyms/jargon (VCC, GND, MSB, flip-flop), never everyday words; ~3 max per beat.
- HARD RULE — ungameable options: all options PARALLEL in length/specificity/grammar; correct answer never the longest/only-explained; vary which is correct.
- Be accurate. This is established, standard material — teach it as a good lecturer would; do NOT hedge or say "I'm not sure".`;

const EXAM_RULES_KNOWLEDGE = `You are Kube. You write a unit's ASSESSMENT pool from your OWN solid knowledge of the standard curriculum (the provided text is a syllabus/outline for scope only).
- Test the outcomes honestly: mix definition, why, and worked styles across the topics. Where the course is practical/lab-based, test the circuit / IC / truth-table / procedure knowledge that exam rewards.
- Hints nudge toward the idea WITHOUT revealing the answer; explanations teach why the right answer is right.
- HARD RULE: no exam question may duplicate a check inside a lesson — write each from a fresh angle.
- HARD RULE — ungameable options: four options PARALLEL in length/specificity/grammar; correct answer never the longest/only-explained; vary the correct slot.`;

// ── The read (intake observation) ─────────────────────────────────────────
const OBSERVE_RULES = `You are Kube, looking at a file a student just uploaded to study from. Read it and react like a sharp, warm, honest friend who knows the subject — NOT a classifier.
- Say plainly WHAT it is and what's actually in it. Be honest if it only outlines/plans and doesn't teach ("this is the roadmap, not the lessons").
- Notice things: duplicates, spill-over, the assessment style (e.g. a practical exam), what's missing to study well.
- Decide if you can teach these topics from your OWN solid knowledge of the standard curriculum (most standard university topics: yes). If yes, offer to build the ladder now WITHOUT needing more files — but always note it'd be your general knowledge, and grounding it in their own notes/manual makes it match their course exactly.
- Then hand the student the wheel with a recommended next step + a couple of alternatives.
- Warm, brief, specific. 2-4 short observation lines. Never invent facts about THIS file.`;

const observationSchema = z.object({
  kind: z.enum(["syllabus", "unit", "pastpaper", "notes", "mixed", "other"]).describe("what this file is"),
  whatItIs: z.string().describe("one warm line naming it, e.g. 'This is your lab course plan for ECE24D — Digital Electronics.'"),
  teaches: z.boolean().describe("true if it actually teaches the concepts; false if it only outlines/plans/lists"),
  observations: z.array(z.string()).describe("2-4 short, specific things you notice (content, duplicates, exam style, what's missing)"),
  canTeachFromKnowledge: z.boolean().describe("can you teach these topics well from your own standard-curriculum knowledge without more files?"),
  suggestedTitle: z.string().describe("a good course/unit title drawn from the file"),
  primaryAction: z.enum(["build_from_knowledge", "digest_as_content", "add_material_first"]).describe("the single best next step for this file"),
  primaryLabel: z.string().describe("the button text for the primary action, e.g. 'Build the ladder from this + your knowledge'"),
  altActions: z.array(z.object({
    id: z.enum(["build_from_knowledge", "digest_as_content", "add_material_first"]),
    label: z.string(),
  })).describe("0-2 alternative next steps (different id from primary)"),
  note: z.string().describe("one honest caveat or reassurance, e.g. 'I'd teach this from standard curriculum — add your lab manual to match your uni exactly.'"),
});
export type Observation = z.infer<typeof observationSchema>;

export async function generateObservation(
  courseTitle: string,
  fileName: string,
  rawText: string,
  images?: SourceImage[],
  meter?: UsageMeter
): Promise<Observation> {
  const client = getAnthropic();
  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    output_config: { effort: "low", format: zodOutputFormat(observationSchema) },
    system: OBSERVE_RULES,
    messages: [
      {
        role: "user",
        content: materialBlocks(
          `Course: ${courseTitle || "(untitled)"}\nUploaded file: ${fileName}\n\nRead this and give the student your honest read + a recommended next step.`,
          rawText,
          images,
          "UPLOADED FILE"
        ),
      },
    ],
  });
  meter?.add(res.usage);
  if (!res.parsed_output) throw new Error("Kube couldn't read that file.");
  return res.parsed_output;
}

const skeletonTopicSchema = z.object({
  id: z
    .string()
    .describe("kebab-case id, unique, prefixed with the unit, e.g. 'u3-recursion'"),
  title: z.string(),
  weight: z
    .enum(["heavy", "medium", "light"])
    .describe(
      "How examinable/load-bearing this concept is. A foundation a heavy topic depends on is itself heavy."
    ),
  deps: z
    .array(z.string())
    .describe(
      "Topic ids that must be understood FIRST — earlier topics of this unit or the existing-topic ids provided."
    ),
  whyItMatters: z.string().describe("One line: why this topic matters for the exam"),
  recap: z.array(z.string()).describe("3-5 key fact lines for quick review / glossary"),
});

const skeletonSchema = z.object({
  sectionTitle: z.string().describe("Short section name for this unit, e.g. 'Control Flow'"),
  tagline: z.string().describe("One calm line under the section header"),
  topics: z
    .array(skeletonTopicSchema)
    .describe(
      "ONE CONCEPT PER TOPIC — split dense source slides into separate topics. 4-10 topics, in dependency order. No lessons here — just the concept map."
    ),
});

export type UnitSkeleton = z.infer<typeof skeletonSchema>;
export type SkeletonTopic = z.infer<typeof skeletonTopicSchema>;

const topicLessonsSchema = z.object({
  lessons: z
    .array(lessonSchema)
    .describe(
      "The four-quarter drill for THIS ONE topic (2-3 lessons for a light concept, 4 for medium/heavy)."
    ),
});

const examBankSchema = z.object({
  examQuestions: z
    .array(
      z.object({
        topicId: z.string().describe("id of one of the unit's topics"),
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
    .describe("8-12 exam questions spread across the topics, tagged by topicId"),
});

/** The whole unit's material, sent to every sub-call as a cache-marked block so
 *  the parallel calls reuse one prompt-cache entry instead of re-billing it. */
function materialBlocks(
  header: string,
  rawText: string,
  images?: SourceImage[],
  label = "UNIT MATERIAL"
): ContentBlock[] {
  const blocks: ContentBlock[] = [
    { type: "text", text: `${header}\n\n--- ${label} ---\n${rawText.slice(0, MAX_UNIT_CHARS)}` },
  ];
  for (const img of images ?? []) {
    blocks.push({
      type: "image",
      source: {
        type: "base64",
        media_type: img.mediaType === "image/png" ? "image/png" : "image/jpeg",
        data: img.data,
      },
    });
  }
  if (images && images.length > 0) {
    blocks.push({
      type: "text",
      text: `The ${images.length} image(s) above are part of this material — slides, diagrams or scanned pages whose content is NOT in the text. Read them as carefully as the text.`,
    });
  }
  // Mark the shared material for prompt caching so the per-topic / exam calls
  // that follow reuse it rather than re-billing the whole document each time.
  const last = blocks[blocks.length - 1] as { cache_control?: { type: "ephemeral" } };
  last.cache_control = { type: "ephemeral" };
  return blocks;
}

// One shared system prompt for the whole unit build. Keeping system + the
// material block byte-identical across the skeleton, every per-topic drill and
// the exam call means they form ONE cached prefix: the skeleton call warms it,
// and every call after reads the document at ~0.1× instead of re-billing it.
// The task-specific rules move into the user message (after the cached
// material), where they cost a few hundred tokens instead of the whole doc.
const UNIT_SYSTEM = `You are Kube, a calm, warm tutor turning a course's material into a genuine learning ladder — one concept per step, taught for real understanding, never a "show a card + Got it" lesson. Follow the specific task instructions in each message exactly.`;

/** The document as a stable, cache-marked prefix — identical across every call
 *  of one build (same rawText, images and label), so caching actually hits. */
function cachedMaterial(rawText: string, images: SourceImage[] | undefined, label: string): ContentBlock[] {
  const blocks: ContentBlock[] = [
    { type: "text", text: `--- ${label} ---\n${rawText.slice(0, MAX_UNIT_CHARS)}` },
  ];
  for (const img of images ?? []) {
    blocks.push({
      type: "image",
      source: { type: "base64", media_type: img.mediaType === "image/png" ? "image/png" : "image/jpeg", data: img.data },
    });
  }
  if (images && images.length > 0) {
    blocks.push({ type: "text", text: `The ${images.length} image(s) above are part of this material — read them as carefully as the text.` });
  }
  const last = blocks[blocks.length - 1] as { cache_control?: { type: "ephemeral" } };
  last.cache_control = { type: "ephemeral" };
  return blocks;
}
const materialLabel = (know: boolean) => (know ? "SYLLABUS / OUTLINE (scope only — teach from your knowledge)" : "COURSE MATERIAL");

/** Step 1: the concept map — section header + topic list, no lessons. Fast. */
export async function generateUnitSkeleton(
  courseTitle: string,
  unitNumber: number,
  rawText: string,
  existingTopics: ExistingTopicRef[],
  images?: SourceImage[],
  mode: "file" | "knowledge" = "file",
  meter?: UsageMeter,
  model?: string
): Promise<UnitSkeleton> {
  const client = getAnthropic();
  const know = mode === "knowledge";
  const existing =
    existingTopics.length > 0
      ? `Topics already on this course's ladder (you may list their ids as dependencies — and do NOT recreate any of them; produce only topics genuinely new here):\n${existingTopics
          .map((t) => `- ${t.id}: ${t.title}`)
          .join("\n")}`
      : "This is the first material — the ladder is empty so far.";
  const res = await client.messages.parse({
    model: model ?? MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium", format: zodOutputFormat(skeletonSchema) },
    system: UNIT_SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          ...cachedMaterial(rawText, images, materialLabel(know)),
          {
            type: "text",
            text: `${know ? CONCEPT_RULES_KNOWLEDGE : CONCEPT_RULES}\n\nCourse: ${courseTitle}\nUnit number: ${unitNumber}\nPrefix all topic ids with "u${unitNumber}-".\n\n${existing}\n\nProduce ONLY the concept map for this unit: the section title, a one-line tagline, and the ordered list of topics (id, title, weight, deps, whyItMatters, recap). Do NOT write any lessons — those come next.`,
          },
        ],
      },
    ],
  });
  meter?.add(res.usage);
  if (!res.parsed_output) throw new Error("Kube couldn't map this unit's concepts.");
  return res.parsed_output;
}

/** Step 2: one topic's four-quarter drill. Called once per topic, in parallel. */
export async function generateTopicLessons(
  courseTitle: string,
  unitNumber: number,
  rawText: string,
  topic: SkeletonTopic,
  allTopicTitles: string[],
  images?: SourceImage[],
  mode: "file" | "knowledge" = "file",
  meter?: UsageMeter,
  model?: string
): Promise<z.infer<typeof lessonSchema>[]> {
  const client = getAnthropic();
  const know = mode === "knowledge";
  // A knowledge build teaches EVERY topic from scratch in one function budget,
  // so each drill must be lean enough that the whole ladder finishes (a full
  // ladder of good lessons beats one perfect lesson and nine that timed out).
  // Grounded file drills, which are fewer and richer, keep the deep settings.
  const res = await client.messages.parse({
    model: model ?? MODEL,
    max_tokens: know ? 7000 : 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: know ? "medium" : "high", format: zodOutputFormat(topicLessonsSchema) },
    system: UNIT_SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          ...cachedMaterial(rawText, images, materialLabel(know)),
          {
            type: "text",
            text: `${know ? DRILL_RULES_KNOWLEDGE : DRILL_RULES}\n\nCourse: ${courseTitle} · Unit ${unitNumber}\n\nThis unit's topics (for context — teach forward toward later ones where natural):\n${allTopicTitles
              .map((t, i) => `${i + 1}. ${t}`)
              .join(
                "\n"
              )}\n\nBUILD THE FOUR-QUARTER CIRCLE FOR EXACTLY ONE TOPIC:\n- id: ${topic.id}\n- title: ${topic.title}\n- weight: ${topic.weight}\n- why it matters: ${topic.whyItMatters}\n- its recap facts: ${topic.recap.join(
              " | "
            )}\n\n${know ? "Teach ONLY this concept from your own solid knowledge (the text above is just the syllabus for scope)." : "Drill ONLY this concept, grounded in the material above."} Return just its lessons array. Use lesson ids like 'q1','q2','q3','q4'.`,
          },
        ],
      },
    ],
  });
  meter?.add(res.usage);
  if (!res.parsed_output) throw new Error(`Kube couldn't drill "${topic.title}".`);
  return res.parsed_output.lessons;
}

/** Step 3: the unit's exam bank. Runs in parallel with the topic drills. */
export async function generateExamBank(
  courseTitle: string,
  unitNumber: number,
  rawText: string,
  topics: SkeletonTopic[],
  images?: SourceImage[],
  mode: "file" | "knowledge" = "file",
  meter?: UsageMeter,
  model?: string
): Promise<z.infer<typeof examBankSchema>["examQuestions"]> {
  const client = getAnthropic();
  const know = mode === "knowledge";
  // Lean on the knowledge path so the exam bank doesn't starve the topic drills
  // of the per-minute output-token budget they share.
  const res = await client.messages.parse({
    model: model ?? MODEL,
    max_tokens: know ? 6000 : 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: know ? "medium" : "high", format: zodOutputFormat(examBankSchema) },
    system: UNIT_SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          ...cachedMaterial(rawText, images, materialLabel(know)),
          {
            type: "text",
            text: `${know ? EXAM_RULES_KNOWLEDGE : EXAM_RULES}\n\nCourse: ${courseTitle} · Unit ${unitNumber}\n\nTopics in this unit (tag every question with one of these ids):\n${topics
              .map((t) => `- ${t.id}: ${t.title} — ${t.whyItMatters}`)
              .join(
                "\n"
              )}\n\nWrite 8-12 exam-bank questions spread across these topics${know ? " from your own knowledge (the text is the syllabus for scope)" : ", grounded in the material above"}.`,
          },
        ],
      },
    ],
  });
  meter?.add(res.usage);
  if (!res.parsed_output) throw new Error("Kube couldn't write this unit's exam questions.");
  return res.parsed_output.examQuestions;
}

/* ------------------------------------------------------------------ *
 * CLIMB (budget) GENERATION — via OpenRouter
 *
 * Climb's job is to DISTILL, not teach: a concept map (topics + recap) and an
 * exam bank, which feed the practice hub, notes/glossary and mock exams. The
 * deep four-quarter drilling (the actual "climb") is a Summit unlock, so Climb
 * skips it entirely — and runs the cheap parts on a budget model. Same schemas
 * as the Sonnet path, so everything downstream is identical.
 * ------------------------------------------------------------------ */

const SKELETON_JSON_SHAPE = `Return ONLY a JSON object (no prose, no markdown fences) of exactly this shape:
{"sectionTitle": string, "tagline": string, "topics": [{"id": string, "title": string, "weight": "heavy"|"medium"|"light", "deps": string[], "whyItMatters": string, "recap": string[]}]}
- ONE idea per topic, in dependency order. Prefix every id with the unit prefix given.
- recap = 3-5 crisp, exam-night fact lines per topic.`;

const EXAM_JSON_SHAPE = `Return ONLY a JSON object (no prose, no markdown fences) of exactly this shape:
{"examQuestions": [{"topicId": string, "prompt": string, "options": [string, string, string, string], "answer": 0, "hint": string, "explanation": string}]}
- Spread the questions across the topics; answer is the 0-based index of the correct option; exactly 4 options each.`;

const LESSON_JSON_SHAPE = `Return ONLY a JSON object (no prose, no markdown fences) of exactly this shape:
{"lessons":[{"id":"q1","title":"1 · Meet it, slowly","steps":[
  {"kind":"teach","title":"short heading (optional)","body":"1-3 short paragraphs; use **bold** for key terms and [[term|one-line definition]] to gloss jargon","code":"optional short code block"},
  {"kind":"check","prompt":"the question","options":["a","b","c","d"],"answer":0,"praise":"warm, specific praise tied to the idea"}
]}]}
- Build the four quarters as lessons q1..q4 (a light topic may use q1..q3). Each step is EITHER a teach beat OR a check. "answer" is the 0-based index; give 3-4 options per check.`;

interface CheapOpts {
  model?: string;
  vision?: string;
  cram?: boolean; // Climb = many small concepts; false = 4-10 deep concepts
  mode?: "file" | "knowledge";
}

/** Concept map on a budget model. Same UnitSkeleton shape as the Sonnet path
 *  (Zod-validated). `cram` (Climb) makes many small concepts; otherwise a
 *  deep-teaching map of 4-10. Image uploads route to the vision model. */
export async function generateUnitSkeletonCheap(
  courseTitle: string,
  unitNumber: number,
  rawText: string,
  existingTopics: ExistingTopicRef[],
  images?: SourceImage[],
  meter?: UsageMeter,
  opts: CheapOpts = {}
): Promise<UnitSkeleton> {
  const useVision = (images?.length ?? 0) > 0;
  const cram = opts.cram !== false;
  const know = opts.mode === "knowledge";
  const existing =
    existingTopics.length > 0
      ? `Existing topics (do NOT recreate; you may list their ids as deps): ${existingTopics.map((t) => t.id).join(", ")}`
      : "This is the first material — the ladder is empty.";
  const count = cram
    ? `CLIMB CRAM MODE: break the unit into MANY small, drillable concepts — aim for 16-22, more granular than a deep course. Every distinct term, formula, circuit or rule is its own concept.`
    : `Map the 4-10 CORE concepts a student must master, in dependency order, each weighted by how examinable it is. These become deep four-quarter lessons, so pick real, teachable concepts — not slivers.`;
  const label = know ? "SYLLABUS / OUTLINE (scope only — teach from your knowledge)" : "COURSE MATERIAL";
  const prompt = `${know ? CONCEPT_RULES_KNOWLEDGE : CONCEPT_RULES}

${count}

Course: ${courseTitle}
Unit ${unitNumber}. Prefix every topic id with "u${unitNumber}-".
${existing}

Produce ONLY the concept map: sectionTitle, tagline, and the ordered topics (id, title, weight, deps, whyItMatters, recap). No lessons.

--- ${label} ---
${rawText.slice(0, MAX_UNIT_CHARS)}

${SKELETON_JSON_SHAPE}`;
  const content = useVision ? [{ type: "text" as const, text: prompt }, ...orImageBlocks(images)] : prompt;
  const { data, usage } = await chatJSON({
    model: useVision ? opts.vision ?? CLIMB_VISION_MODEL : opts.model ?? CLIMB_MODEL,
    system: UNIT_SYSTEM,
    content,
    maxTokens: 8000,
  });
  meter?.add(usage);
  return skeletonSchema.parse(data);
}

/** One topic's four-quarter drill on a budget model — the Summit "deep" step,
 *  run cheaply. Same lessons shape as the Sonnet path (Zod-validated). */
export async function generateTopicLessonsCheap(
  courseTitle: string,
  unitNumber: number,
  rawText: string,
  topic: SkeletonTopic,
  allTopicTitles: string[],
  images?: SourceImage[],
  meter?: UsageMeter,
  opts: CheapOpts = {}
): Promise<z.infer<typeof lessonSchema>[]> {
  const useVision = (images?.length ?? 0) > 0;
  const know = opts.mode === "knowledge";
  const label = know ? "SYLLABUS / OUTLINE (scope only — teach from your knowledge)" : "COURSE MATERIAL";
  const prompt = `${know ? DRILL_RULES_KNOWLEDGE : DRILL_RULES}

Course: ${courseTitle} · Unit ${unitNumber}
This unit's topics (context — teach forward where natural): ${allTopicTitles.map((t, i) => `${i + 1}. ${t}`).join(" · ")}

DRILL EXACTLY ONE TOPIC into its four-quarter circle:
- id: ${topic.id}
- title: ${topic.title}
- weight: ${topic.weight}
- why it matters: ${topic.whyItMatters}
- recap facts: ${topic.recap.join(" | ")}

${know ? "Teach ONLY this concept from your own solid knowledge (the text below is the syllabus for scope)." : "Drill ONLY this concept, grounded in the material below."} Use lesson ids q1..q4.

--- ${label} ---
${rawText.slice(0, MAX_UNIT_CHARS)}

${LESSON_JSON_SHAPE}`;
  const content = useVision ? [{ type: "text" as const, text: prompt }, ...orImageBlocks(images)] : prompt;
  const { data, usage } = await chatJSON({
    model: useVision ? opts.vision ?? SUMMIT_VISION_MODEL : opts.model ?? SUMMIT_MODEL,
    system: UNIT_SYSTEM,
    content,
    maxTokens: 12000,
  });
  meter?.add(usage);
  return topicLessonsSchema.parse(data).lessons;
}

/** Exam bank on a budget model. Same shape as the Sonnet path. */
export async function generateExamBankCheap(
  courseTitle: string,
  unitNumber: number,
  rawText: string,
  topics: SkeletonTopic[],
  images?: SourceImage[],
  meter?: UsageMeter,
  opts: CheapOpts = {}
): Promise<z.infer<typeof examBankSchema>["examQuestions"]> {
  const useVision = (images?.length ?? 0) > 0;
  const know = opts.mode === "knowledge";
  const label = know ? "SYLLABUS / OUTLINE (scope only)" : "COURSE MATERIAL";
  const list = topics.map((t) => `- ${t.id}: ${t.title} — ${t.whyItMatters}`).join("\n");
  const prompt = `${know ? EXAM_RULES_KNOWLEDGE : EXAM_RULES}

Course: ${courseTitle} · Unit ${unitNumber}
Topics (tag every question with one of these ids):
${list}

Write 10-16 exam-bank questions spread across these topics${know ? " from your own knowledge" : ", grounded in the material below"}.

--- ${label} ---
${rawText.slice(0, MAX_UNIT_CHARS)}

${EXAM_JSON_SHAPE}`;
  const content = useVision ? [{ type: "text" as const, text: prompt }, ...orImageBlocks(images)] : prompt;
  const { data, usage } = await chatJSON({
    model: useVision ? opts.vision ?? CLIMB_VISION_MODEL : opts.model ?? CLIMB_MODEL,
    system: UNIT_SYSTEM,
    content,
    maxTokens: 7000,
  });
  meter?.add(usage);
  return examBankSchema.parse(data).examQuestions;
}

/** Assemble a Climb unit: topics carry their recap (feeding practice + notes)
 *  but NO lessons — the deep drilling is Summit-only. Exam questions are
 *  sanitized against the topic ids just like the Sonnet path. */
export function assembleClimbUnit(
  skeleton: UnitSkeleton,
  examQuestions: z.infer<typeof examBankSchema>["examQuestions"],
  unitNumber: number,
  existingTopicIds: string[]
): { section: Section; questions: ExamQuestion[] } {
  const known = new Set(existingTopicIds);
  const topics: Topic[] = [];
  for (const t of skeleton.topics) {
    let id = t.id;
    if (known.has(id)) id = `u${unitNumber}-${id}`.slice(0, 80);
    if (known.has(id)) continue;
    topics.push({
      id,
      title: t.title,
      unit: unitNumber,
      weight: t.weight,
      deps: t.deps.filter((d) => known.has(d)),
      whyItMatters: t.whyItMatters,
      recap: t.recap.slice(0, 6),
      lessons: [],
      steps: [],
    });
    known.add(id);
  }
  const topicIds = new Set(topics.map((t) => t.id));
  const questions: ExamQuestion[] = examQuestions
    .filter(
      (q) => topicIds.has(q.topicId) && q.options.length >= 2 && q.answer >= 0 && q.answer < q.options.length
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
      letter: "?",
      title: skeleton.sectionTitle,
      tagline: skeleton.tagline,
      unit: unitNumber,
      topics,
    },
    questions,
  };
}

/** Run tasks with a small concurrency cap so we parallelize without opening
 *  dozens of Opus calls at once (rate limits, memory). */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker())
  );
  return out;
}

/** Stitch a skeleton + its per-topic lessons + exam questions into the exact
 *  GeneratedUnit shape assembleUnit already consumes. Topics whose drill call
 *  failed (null lessons) are dropped rather than shipped empty. */
export function composeGeneratedUnit(
  skeleton: UnitSkeleton,
  lessonsByTopic: (z.infer<typeof lessonSchema>[] | null)[],
  examQuestions: z.infer<typeof examBankSchema>["examQuestions"]
): GeneratedUnit {
  const topics = skeleton.topics
    .map((t, i) => ({ t, lessons: lessonsByTopic[i] }))
    .filter((x) => x.lessons && x.lessons.length > 0)
    .map((x) => ({
      id: x.t.id,
      title: x.t.title,
      weight: x.t.weight,
      deps: x.t.deps,
      whyItMatters: x.t.whyItMatters,
      recap: x.t.recap,
      lessons: x.lessons!,
    }));
  return {
    sectionTitle: skeleton.sectionTitle,
    tagline: skeleton.tagline,
    topics,
    examQuestions,
  };
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
        const safeSvg = s.svg ? sanitizeSvg(s.svg) : null;
        steps.push({
          kind: "teach",
          body: s.body,
          ...(s.title ? { title: s.title } : {}),
          ...(s.code ? { code: s.code } : {}),
          ...(safeSvg ? { svg: safeSvg } : {}),
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
      "You convert a real past exam paper into Kube assessment questions. Keep each question's substance and difficulty faithful to the paper — these show how the course is actually tested. Convert non-MCQ questions into fair 4-option MCQs testing the same idea. Preserve printed CO and Bloom's/RBT level tags per question (null if absent). Map every question onto the closest topic id from the provided ladder; skip questions that fit no topic. Papers often arrive as scanned page images — read every page image carefully and convert its questions exactly as if it were text. UNGAMEABLE OPTIONS: make all four options parallel in length, specificity and grammar; the correct answer must never be the longest or the only fully-explained one, and the distractors must be genuine plausible misconceptions, not obvious throwaways. Vary which option is correct — never habitually place it in one slot.",
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
