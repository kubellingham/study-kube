import Anthropic from "@anthropic-ai/sdk";

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
