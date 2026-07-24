// Token accounting for a digest. Every Claude call in a build reports how many
// tokens it used — regular input, cached-write input, cached-read input, and
// output. We sum them into one meter and turn the total into a dollar estimate
// so a digest can show its own cost. The tokens are REAL (straight from the
// API); the dollar figure applies a fixed rate to them, so the authoritative
// bill is always the Anthropic Console — this is the in-app mirror of it.

/** The usage shape the Anthropic SDK returns on every response/stream. */
export interface RawUsage {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
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
  }

  costUsd(): number {
    const dollars =
      (this.input * this.priceIn +
        this.cacheWrite * this.priceIn * CACHE_WRITE_MULT +
        this.cacheRead * this.priceIn * CACHE_READ_MULT +
        this.output * this.priceOut) /
      1_000_000;
    return dollars;
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
