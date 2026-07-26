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

/** The generation model: course digestion, the intake read, past papers,
 *  summaries. Defaults to Sonnet 5 — Opus 4.8 costs 5×/1.7× (in/out) more and
 *  digestion is our most token-heavy work, so it is NOT a safe default. Set
 *  ANTHROPIC_MODEL to override (e.g. claude-opus-4-8 for a premium "deep" tier
 *  once we route by plan — see KUBE_MONETIZATION_STRATEGY.md §6). */
export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

/** The conversational model: in-lesson chat and its background struggle
 *  notes — high-volume, low-stakes turns where Sonnet's speed and price fit.
 *  Override with ANTHROPIC_CHAT_MODEL (e.g. claude-sonnet-4-6) to compare. */
export const CHAT_MODEL = process.env.ANTHROPIC_CHAT_MODEL || "claude-sonnet-5";

/** The OWNER's digestion model — the top-of-range Claude, used only for the
 *  owner account so we can compare premium quality against the budget engine
 *  on the same file. Defaults to Opus 5; set OWNER_MODEL to override (e.g.
 *  claude-opus-4-8 if the key doesn't have Opus 5 access yet). Priced at
 *  Opus-class rates for the cost meter. */
export const OWNER_MODEL = process.env.OWNER_MODEL || "claude-opus-5";
export const OWNER_PRICE_IN = Number(process.env.OWNER_PRICE_IN ?? 5);
export const OWNER_PRICE_OUT = Number(process.env.OWNER_PRICE_OUT ?? 25);

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
