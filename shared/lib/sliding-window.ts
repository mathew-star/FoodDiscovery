/**
 * Sliding-window counter (the approximation Upstash and Cloudflare use): the previous fixed window's
 * count is weighted by how much of it still overlaps the sliding window. O(1) state per key.
 */
export type WindowDecision = { allowed: boolean; remaining: number; retryAfterMs: number };

export function slidingWindowDecision(input: {
  previousCount: number;
  currentCount: number;
  elapsedMs: number;
  windowMs: number;
  limit: number;
  /** Units this request uses, e.g. five dish ratings in one submission. */
  cost?: number;
}): WindowDecision {
  const { previousCount, currentCount, elapsedMs, windowMs, limit, cost = 1 } = input;
  const overlap = (windowMs - elapsedMs) / windowMs;
  const estimate = previousCount * overlap + currentCount;
  if (estimate + cost > limit) {
    return { allowed: false, remaining: 0, retryAfterMs: Math.max(1, windowMs - elapsedMs) };
  }
  return { allowed: true, remaining: Math.max(0, Math.floor(limit - estimate - cost)), retryAfterMs: 0 };
}

export function windowIndex(now: number, windowMs: number): { index: number; elapsedMs: number } {
  return { index: Math.floor(now / windowMs), elapsedMs: now % windowMs };
}
