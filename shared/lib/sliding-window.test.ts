import { describe, expect, it } from 'vitest';
import { slidingWindowDecision, windowIndex } from './sliding-window';

describe('slidingWindowDecision', () => {
  const base = { windowMs: 60_000, limit: 10 };

  it('allows until the limit within one window', () => {
    expect(slidingWindowDecision({ ...base, previousCount: 0, currentCount: 8, elapsedMs: 1_000 })).toEqual({
      allowed: true,
      remaining: 1,
      retryAfterMs: 0,
    });
    expect(
      slidingWindowDecision({ ...base, previousCount: 0, currentCount: 9, elapsedMs: 1_000 }),
    ).toMatchObject({
      allowed: true,
      remaining: 0,
    });
    expect(slidingWindowDecision({ ...base, previousCount: 0, currentCount: 10, elapsedMs: 1_000 })).toEqual({
      allowed: false,
      remaining: 0,
      retryAfterMs: 59_000,
    });
  });

  it('weights the previous window by its remaining overlap', () => {
    expect(
      slidingWindowDecision({ ...base, previousCount: 13, currentCount: 0, elapsedMs: 15_000 }).allowed,
    ).toBe(false);
    expect(
      slidingWindowDecision({ ...base, previousCount: 10, currentCount: 0, elapsedMs: 45_000 }),
    ).toMatchObject({
      allowed: true,
      remaining: 6,
    });
  });

  it('never reports a zero retry when blocked', () => {
    expect(
      slidingWindowDecision({ ...base, previousCount: 0, currentCount: 10, elapsedMs: 60_000 }).retryAfterMs,
    ).toBe(1);
  });
});

it('splits time into fixed windows', () => {
  expect(windowIndex(125_000, 60_000)).toEqual({ index: 2, elapsedMs: 5_000 });
});
