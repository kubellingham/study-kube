// Token accounting for a digest. Every Claude call in a build reports how many
// tokens it used — regular input, cached-write input, cached-read input, and
// output. We sum them into one meter and turn the total into a dollar estimate
// so a digest can show its own cost. The tokens are REAL (straight from the
// API). The dollars are real too wherever the provider reports its charge
// (OpenRouter does); only calls without one fall back to a fixed rate.

/** The usage shape the Anthropic SDK returns on every response/stream. */
export interface RawUsage {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  /** The provider's own charge for the call, in USD, when it reports one
   *  (OpenRouter does). Used as-is instead of the token estimate. */
  cost_usd?: number | null;
}

// Sonnet 5 list price, USD per million tokens. Cache-write is 1.25× input,
// cache-read is 0.1× input (Anthropic prompt-caching pricing). Override via env
// if the account is on intro/other pricing so the estimate tracks the real bill.
const PER_M = {
  input: Number(process.env.KUBE_PRICE_IN ?? 3),
  output: Number(process.env.KUBE_PRICE_OUT ?? 15),
};
const CACHE_WRITE_MULT = 1.25;
const CACHE_READ_MULT = 0.1;

export interface UsageSummary {
  calls: number;
  inputTokens: number; // uncached input
  outputTokens: number;
  cacheWriteTokens: number;
  cacheReadTokens: number;
  costUsd: number;
}

/** Accumulates token usage across every call of one digest. Pass one instance
 *  into each generator; read `.summary()` when the build finishes. Construct
 *  with per-M prices to cost a non-Sonnet tier (e.g. Climb's budget model). */
export class UsageMeter {
  calls = 0;
  input = 0;
  output = 0;
  cacheWrite = 0;
  cacheRead = 0;
  /** Dollars the provider reported directly, and the estimate for the calls
   *  that came without a figure. Their sum is the meter's cost. */
  private reportedUsd = 0;
  private estimatedUsd = 0;
  private priceIn: number;
  private priceOut: number;

  constructor(priceIn: number = PER_M.input, priceOut: number = PER_M.output) {
    this.priceIn = priceIn;
    this.priceOut = priceOut;
  }

  add(u?: RawUsage | null): void {
    if (!u) return;
    this.calls += 1;
    this.input += u.input_tokens ?? 0;
    this.output += u.output_tokens ?? 0;
    this.cacheWrite += u.cache_creation_input_tokens ?? 0;
    this.cacheRead += u.cache_read_input_tokens ?? 0;
    if (typeof u.cost_usd === "number" && Number.isFinite(u.cost_usd) && u.cost_usd >= 0) {
      this.reportedUsd += u.cost_usd;
      return;
    }
    this.estimatedUsd +=
      ((u.input_tokens ?? 0) * this.priceIn +
        (u.cache_creation_input_tokens ?? 0) * this.priceIn * CACHE_WRITE_MULT +
        (u.cache_read_input_tokens ?? 0) * this.priceIn * CACHE_READ_MULT +
        (u.output_tokens ?? 0) * this.priceOut) /
      1_000_000;
  }

  costUsd(): number {
    return this.reportedUsd + this.estimatedUsd;
  }

  summary(): UsageSummary {
    return {
      calls: this.calls,
      inputTokens: this.input,
      outputTokens: this.output,
      cacheWriteTokens: this.cacheWrite,
      cacheReadTokens: this.cacheRead,
      // Keep 4 decimals — a digest can cost a fraction of a cent.
      costUsd: Math.round(this.costUsd() * 10_000) / 10_000,
    };
  }
}

/** "$0.42" / "1.3¢" / "<0.1¢" — a compact, honest label for a small figure. */
export function formatCost(usd: number): string {
  if (usd >= 1) return `$${usd.toFixed(2)}`;
  const cents = usd * 100;
  if (cents >= 1) return `${cents.toFixed(1)}¢`;
  if (cents <= 0) return "—";
  return "<0.1¢";
}
