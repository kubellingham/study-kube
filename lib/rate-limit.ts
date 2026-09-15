// In-memory rate limiter, keyed on any string (uid, IP, ...). Lives on a
// single warm serverless instance, so the ceiling isn't strict across the
// fleet — but it's enough to stop an accidental double-click firehose or a
// bored student replaying the same PDF twenty times. For anything stricter,
// swap the backing Map for Upstash/Redis behind the same signature.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  /** Milliseconds until the window resets — 0 when `ok` is true. */
  retryAfterMs: number;
  /** Attempts already used in the current window. */
  count: number;
  /** Cap for the current window. */
  limit: number;
}

/**
 * Try to consume one token for `key`, allowing up to `limit` per `windowMs`.
 * Fixed window (simple, honest, no fancy interpolation).
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0, count: 1, limit };
  }
  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterMs: existing.resetAt - now,
      count: existing.count,
      limit,
    };
  }
  existing.count += 1;
  return { ok: true, retryAfterMs: 0, count: existing.count, limit };
}
