import 'server-only';

import { slidingWindowDecision, windowIndex, type WindowDecision } from '@/shared/lib/sliding-window';
import { ConfigurationError } from './env';
import { logger } from './logger';

export type RateLimitPolicy = { name: string; limit: number; windowMs: number };

type Counts = { previousCount: number; currentCount: number };

export interface RateLimitStore {
  // Atomically reads both windows and increments the current one only when the request is allowed.
  hit(
    keys: { current: string; previous: string },
    policy: RateLimitPolicy,
    elapsedMs: number,
  ): Promise<Counts>;
}

/*
  Mirrors slidingWindowDecision: the counts it returns are read before the increment, so the
  TypeScript decision over them reproduces the script's verdict exactly.
*/
const slidingWindowScript = `
local current = tonumber(redis.call('GET', KEYS[1]) or '0')
local previous = tonumber(redis.call('GET', KEYS[2]) or '0')
local windowMs = tonumber(ARGV[1])
local elapsed = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
if previous * ((windowMs - elapsed) / windowMs) + current + 1 <= limit then
  redis.call('INCR', KEYS[1])
  redis.call('PEXPIRE', KEYS[1], windowMs * 2)
end
return { previous, current }
`;

async function redisStore(): Promise<RateLimitStore> {
  const { getRedis } = await import('./redis');
  const redis = getRedis();
  return {
    async hit(keys, policy, elapsedMs) {
      const reply = (await redis.eval(
        slidingWindowScript,
        2,
        keys.current,
        keys.previous,
        policy.windowMs,
        elapsedMs,
        policy.limit,
      )) as [number, number];
      return { previousCount: Number(reply[0]), currentCount: Number(reply[1]) };
    },
  };
}

export function createMemoryStore(): RateLimitStore {
  const counters = new Map<string, { count: number; expiresAt: number }>();
  return {
    async hit(keys, policy, elapsedMs) {
      const now = Date.now();
      const read = (key: string) => {
        const entry = counters.get(key);
        if (!entry || entry.expiresAt <= now) {
          counters.delete(key);
          return 0;
        }
        return entry.count;
      };
      const counts = { previousCount: read(keys.previous), currentCount: read(keys.current) };
      if (
        slidingWindowDecision({ ...counts, elapsedMs, windowMs: policy.windowMs, limit: policy.limit })
          .allowed
      ) {
        counters.set(keys.current, { count: counts.currentCount + 1, expiresAt: now + policy.windowMs * 2 });
      }
      return counts;
    },
  };
}

const globalForLimiter = globalThis as typeof globalThis & { fdnRateLimitStore?: Promise<RateLimitStore> };

function defaultStore(): Promise<RateLimitStore> {
  if (process.env.REDIS_URL?.trim()) return redisStore();
  if (process.env.NODE_ENV === 'production') {
    return Promise.reject(new ConfigurationError('REDIS_URL is required for rate limiting in production'));
  }
  return Promise.resolve(createMemoryStore());
}

/*
  Fails closed: when the store is unreachable the request is refused, so an outage cannot be used
  to bypass limits. Identifiers must already be hashed or opaque; they become Redis keys.
*/
export async function limit(
  policy: RateLimitPolicy,
  identifier: string,
  options: { store?: RateLimitStore; now?: number } = {},
): Promise<WindowDecision> {
  const now = options.now ?? Date.now();
  const { index, elapsedMs } = windowIndex(now, policy.windowMs);
  // Hash tag keeps both windows in one slot on clustered Redis.
  const prefix = `rl:{${policy.name}:${identifier}}`;
  const keys = { current: `${prefix}:${index}`, previous: `${prefix}:${index - 1}` };

  try {
    globalForLimiter.fdnRateLimitStore ??= defaultStore();
    const store = options.store ?? (await globalForLimiter.fdnRateLimitStore);
    const counts = await store.hit(keys, policy, elapsedMs);
    return slidingWindowDecision({ ...counts, elapsedMs, windowMs: policy.windowMs, limit: policy.limit });
  } catch (error) {
    if (!options.store) globalForLimiter.fdnRateLimitStore = undefined;
    logger.error({ err: error, policy: policy.name }, 'rate limit store unavailable');
    return { allowed: false, remaining: 0, retryAfterMs: policy.windowMs - elapsedMs };
  }
}
