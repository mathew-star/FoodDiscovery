import { describe, expect, it } from 'vitest';
import { err, ok, type Result } from './result';

describe('result', () => {
  it('narrows on ok', () => {
    const value: Result<number> = ok(3);
    expect(value.ok && value.data).toBe(3);
  });

  it('carries error details', () => {
    const value: Result<number> = err({ code: 'rate_limited', retryAfterSeconds: 30 });
    expect(value).toEqual({ ok: false, error: { code: 'rate_limited', retryAfterSeconds: 30 } });
  });
});
