import 'server-only';

import Redis from 'ioredis';
import { ConfigurationError, requireEnv } from './env';

function createRedisClient(): Redis {
  const url = requireEnv('REDIS_URL');
  const tls = url.startsWith('rediss://');

  // Upstash is TLS-only. Plain redis:// is accepted in development, and for a loopback server in
  // production builds (CI and local e2e run `next start` against a local Redis).
  const plainAllowed =
    url.startsWith('redis://') &&
    (process.env.NODE_ENV !== 'production' || ['localhost', '127.0.0.1'].includes(new URL(url).hostname));
  if (!tls && !plainAllowed) {
    throw new ConfigurationError('REDIS_URL must be a TLS Redis URL (rediss://)');
  }

  return new Redis(url, {
    lazyConnect: true,
    connectTimeout: 5_000,
    maxRetriesPerRequest: 1,
  });
}

const globalForRedis = globalThis as typeof globalThis & { fdnRedis?: Redis };

/** Lazily created so modules that only sometimes need Redis can import this without REDIS_URL. */
export function getRedis(): Redis {
  globalForRedis.fdnRedis ??= createRedisClient();
  return globalForRedis.fdnRedis;
}
