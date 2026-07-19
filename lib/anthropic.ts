import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  summarySchema,
  flashcardsSchema,
  quizSchema,
  type SummaryParsed,
  type FlashcardsParsed,
  type QuizParsed,
} from "@/lib/schemas";
import {
  SUMMARY_SYSTEM,
  FLASHCARDS_SYSTEM,
  QUIZ_SYSTEM,
  TUTOR_SYSTEM,
  tutorMaterialBlock,
} from "@/lib/prompts";

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

let cached: Anthropic | null = null;

/** Lazily construct the Anthropic client so a missing key fails at call time,
 *  not at module import (which would break the whole route). */
export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local (see .env.example)."
    );
  }
  if (!cached) cached = new Anthropic();
  return cached;
}

// Materials can be long; cap what we send so a single huge upload can't blow
// past sane limits. ~120k chars is well within Opus 4.8's context window.
const MAX_MATERIAL_CHARS = 120_000;

function clip(text: string): string {
  return text.length > MAX_MATERIAL_CHARS
    ? text.slice(0, MAX_MATERIAL_CHARS)
    : text;
}

export async function generateSummary(rawText: string): Promise<SummaryParsed> {
  const client = getAnthropic();
  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: zodOutputFormat(summarySchema),
    },
    system: SUMMARY_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Summarize the following material and extract its key concepts.\n\n---\n${clip(
          rawText
        )}`,
      },
    ],
  });
  if (!res.parsed_output) {
    throw new Error("Model did not return a valid summary.");
  }
  return res.parsed_output;
}

export async function generateFlashcards(
  rawText: string,
  count = 15
): Promise<FlashcardsParsed> {
  const client = getAnthropic();
  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: zodOutputFormat(flashcardsSchema),
    },
    system: FLASHCARDS_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Create about ${count} high-quality study flashcards from the following material.\n\n---\n${clip(
          rawText
        )}`,
      },
    ],
  });
  if (!res.parsed_output) {
    throw new Error("Model did not return valid flashcards.");
  }
  return res.parsed_output;
}

export async function generateQuiz(
  rawText: string,
  count = 8
): Promise<QuizParsed> {
  const client = getAnthropic();
  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: zodOutputFormat(quizSchema),
    },
    system: QUIZ_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Write a ${count}-question multiple-choice practice quiz from the following material. Each question needs exactly 4 options.\n\n---\n${clip(
          rawText
        )}`,
      },
    ],
  });
  if (!res.parsed_output) {
    throw new Error("Model did not return a valid quiz.");
  }
  // Defensive: keep only well-formed questions.
  const questions = res.parsed_output.questions.filter(
    (q) =>
      q.options.length === 4 &&
      q.answer_index >= 0 &&
      q.answer_index < q.options.length
  );
  return { questions };
}

export interface TutorTurn {
  role: "user" | "assistant";
  content: string;
}

/** Returns the SDK message stream for a tutor turn. The route converts it into
 *  an HTTP streaming response. The material is placed in a cached system block
 *  so multi-turn chat over one document reuses the prompt cache. */
export function tutorStream(
  materialTitle: string,
  materialText: string,
  history: TutorTurn[]
) {
  const client = getAnthropic();
  return client.messages.stream({
    model: MODEL,
    max_tokens: 4000,
    thinking: { type: "adaptive", display: "summarized" },
    system: [
      { type: "text", text: TUTOR_SYSTEM },
      {
        type: "text",
        text: tutorMaterialBlock(materialTitle, clip(materialText)),
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: history.map((t) => ({ role: t.role, content: t.content })),
  });
}
