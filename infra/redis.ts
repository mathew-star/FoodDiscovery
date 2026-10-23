import 'server-only';

import Redis from 'ioredis';
import { ConfigurationError, requireEnv } from './env';

function createRedisClient(): Redis {
  const url = requireEnv('REDIS_URL');

  if (!url.startsWith('rediss://')) {
    throw new ConfigurationError('REDIS_URL must be a TLS Redis URL (rediss://)');
  }

  return new Redis(url, {
    lazyConnect: true,
    connectTimeout: 5_000,
    maxRetriesPerRequest: 1,
  });
}

const globalForRedis = globalThis as typeof globalThis & { dishRedis?: Redis };

export const redis = globalForRedis.dishRedis ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.dishRedis = redis;
}
