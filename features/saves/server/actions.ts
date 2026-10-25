'use server';

import { getSession } from '@/features/auth/queries/session';
import { logger } from '@/infra/logger';
import { limit, type RateLimitPolicy } from '@/infra/ratelimit';
import { err, ok, type Result } from '@/shared/lib/result';
import { importDeviceSavesInputSchema, saveTargetSchema } from '../schemas/save-target';
import { importDeviceSaves, listSavedKeys, toggleSave } from './service';

const savePolicy: RateLimitPolicy = { name: 'saves:user', limit: 120, windowMs: 60_000 };

async function rateLimited(userId: string): Promise<Result<never> | null> {
  const decision = await limit(savePolicy, userId);
  return decision.allowed
    ? null
    : err({ code: 'rate_limited', retryAfterSeconds: Math.ceil(decision.retryAfterMs / 1000) });
}

async function run<T>(work: () => Promise<Result<T>>, label: string): Promise<Result<T>> {
  try {
    return await work();
  } catch (error) {
    logger.error({ err: error }, label);
    return err({ code: 'internal' });
  }
}

export async function toggleSaveAction(input: unknown): Promise<Result<{ saved: boolean }>> {
  const session = await getSession();
  if (!session) return err({ code: 'unauthenticated' });
  const parsed = saveTargetSchema.safeParse(input);
  if (!parsed.success) return err({ code: 'invalid_input' });
  const limited = await rateLimited(session.userId);
  if (limited) return limited;
  return run(() => toggleSave(session.userId, parsed.data), 'toggle save failed');
}

export async function importDeviceSavesAction(input: unknown): Promise<Result<{ imported: number }>> {
  const session = await getSession();
  if (!session) return err({ code: 'unauthenticated' });
  const parsed = importDeviceSavesInputSchema.safeParse(input);
  if (!parsed.success) return err({ code: 'invalid_input' });
  const limited = await rateLimited(session.userId);
  if (limited) return limited;
  return run(() => importDeviceSaves(session.userId, parsed.data), 'device save import failed');
}

/** Keys of the member's "Want to try" items, so Save buttons can show their state. */
export async function listSavedKeysAction(): Promise<Result<string[]>> {
  const session = await getSession();
  if (!session) return err({ code: 'unauthenticated' });
  return run(async () => ok(await listSavedKeys(session.userId)), 'saved keys failed');
}
