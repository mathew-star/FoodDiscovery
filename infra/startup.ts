import 'server-only';

import { HeadBucketCommand } from '@aws-sdk/client-s3';
import { sql } from 'drizzle-orm';
import { logger, toLoggedError } from './logger';

const CHECK_TIMEOUT_MS = 5_000;

async function withTimeout<T>(operation: Promise<T>): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('Startup check timed out')), CHECK_TIMEOUT_MS);
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}

async function checkService(service: string, check: () => Promise<unknown>): Promise<void> {
  const startedAt = performance.now();

  try {
    await withTimeout(check());
    logger.info(
      { service, status: 'ready', durationMs: Math.round(performance.now() - startedAt) },
      'Infrastructure check',
    );
  } catch (error) {
    logger.error(
      {
        service,
        status: 'unavailable',
        durationMs: Math.round(performance.now() - startedAt),
        error: toLoggedError(error, true),
      },
      'Infrastructure check',
    );
  }
}

const globalForStartup = globalThis as typeof globalThis & { dishExceptionMonitorInstalled?: boolean };

export async function registerServer(): Promise<void> {
  if (!globalForStartup.dishExceptionMonitorInstalled) {
    process.on('uncaughtExceptionMonitor', (error, origin) => {
      logger.fatal({ origin, error: toLoggedError(error) }, 'Uncaught process exception');
    });
    globalForStartup.dishExceptionMonitorInstalled = true;
  }

  await Promise.all([
    checkService('neon', async () => {
      const { getDb } = await import('@/db/client');
      await getDb().execute(sql`select 1`);
    }),
    checkService('upstash-redis', async () => {
      const { redis } = await import('./redis');
      await redis.ping();
    }),
    checkService('cloudflare-r2', async () => {
      const { r2, r2Bucket } = await import('./r2');
      await r2.send(new HeadBucketCommand({ Bucket: r2Bucket }), {
        abortSignal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
      });
    }),
  ]);
}
