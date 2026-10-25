import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('./logger', () => ({ logger: { error: vi.fn() } }));

const { createMemoryStore, limit } = await import('./ratelimit');

const policy = { name: 'test', limit: 3, windowMs: 60_000 };

describe('limit', () => {
  it('allows up to the limit, then refuses with a retry hint', async () => {
    const store = createMemoryStore();
    const now = 120_000 + 10_000;
    const results = [];
    for (let attempt = 0; attempt < 4; attempt += 1) {
      results.push(await limit(policy, 'device-a', { store, now }));
    }
    expect(results.map((result) => result.allowed)).toEqual([true, true, true, false]);
    expect(results[2]?.remaining).toBe(0);
    expect(results[3]?.retryAfterMs).toBe(50_000);
  });

  it('keeps identifiers and policies apart', async () => {
    const store = createMemoryStore();
    const now = 5_000;
    for (let attempt = 0; attempt < 3; attempt += 1) await limit(policy, 'device-a', { store, now });
    expect((await limit(policy, 'device-b', { store, now })).allowed).toBe(true);
    expect((await limit({ ...policy, name: 'other' }, 'device-a', { store, now })).allowed).toBe(true);
  });

  it('carries the previous window into the next one', async () => {
    const store = createMemoryStore();
    for (let attempt = 0; attempt < 3; attempt += 1) await limit(policy, 'device-a', { store, now: 59_000 });
    // 1 s into the next window the previous three still count at 59/60 weight.
    expect((await limit(policy, 'device-a', { store, now: 61_000 })).allowed).toBe(false);
  });

  it('fails closed when the store errors', async () => {
    const store = { hit: () => Promise.reject(new Error('down')) };
    expect(await limit(policy, 'device-a', { store, now: 30_000 })).toEqual({
      allowed: false,
      remaining: 0,
      retryAfterMs: 30_000,
    });
  });
});
