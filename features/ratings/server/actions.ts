'use server';

import { headers } from 'next/headers';
import { revalidateTag, updateTag } from 'next/cache';
import { getSession } from '@/features/auth/queries/session';
import { getRankingConfig } from '@/features/ratings/queries/ranking-config';
import { clientIpKey } from '@/infra/client-ip';
import { getDb } from '@/db/client';
import { logger } from '@/infra/logger';
import { limit } from '@/infra/ratelimit';
import { err, ok, type Result } from '@/shared/lib/result';
import { rateBranchInputSchema } from '../schemas/rate-input';
import { findMemberTrust } from './repo';
import { getRateSheet, rateBranch, type RateBranchOutcome } from './service';

/** Spec §7.1 dish-rating quotas: per member by trust level, and per IP. */
async function overQuota(userId: string, trust: 't0' | 't1' | 't2' | 'founding', cost: number) {
  const config = await getRankingConfig('action_limits');
  const quota = config.dishRatings;
  const windowMs = config.windowMs;
  for (const [policy, identifier] of [
    [{ name: `ratings:${trust}`, limit: quota[trust], windowMs }, userId],
    [{ name: 'ratings:ip', limit: quota.ip, windowMs }, clientIpKey(await headers())],
  ] as const) {
    const decision = await limit(policy, identifier, { cost });
    if (!decision.allowed)
      return err({
        code: 'rate_limited' as const,
        retryAfterSeconds: Math.ceil(decision.retryAfterMs / 1000),
      });
  }
  return null;
}

/** Order per AGENTS: session → parse → permission (onboarded) → limit → service → cache tags. */
export async function rateBranchAction(input: unknown): Promise<Result<RateBranchOutcome>> {
  const session = await getSession();
  if (!session) return err({ code: 'unauthenticated' });
  const parsed = rateBranchInputSchema.safeParse(input);
  if (!parsed.success) return err({ code: 'invalid_input' });

  try {
    const trust = await findMemberTrust(getDb(), session.userId);
    if (!trust) return err({ code: 'forbidden', message: 'onboarding_required' });
    const limited = await overQuota(session.userId, trust, Math.max(1, parsed.data.dishes.length));
    if (limited) return limited;

    const result = await rateBranch(session.userId, parsed.data);
    if (result.ok) {
      // The rater sees their own change at once; city-wide lists refresh in the background.
      updateTag(`branch:${parsed.data.branchId}`);
      updateTag(`branch-slug:${result.data.branchSlug}`);
      for (const dishId of result.data.dishIds) updateTag(`branch-dish:${dishId}`);
      revalidateTag('branch-dishes', 'max');
      revalidateTag('search', 'max');
    }
    return result;
  } catch (error) {
    logger.error({ err: error }, 'rating failed');
    return err({ code: 'internal' });
  }
}

export type RateSheetData = Awaited<ReturnType<typeof getRateSheet>>;

/** Loads the sheet when a member opens it: the branch's dishes and their current answers. */
export async function loadRateSheetAction(branchId: unknown): Promise<Result<RateSheetData>> {
  const session = await getSession();
  if (!session) return err({ code: 'unauthenticated' });
  if (typeof branchId !== 'string' || !/^[0-9a-f-]{36}$/.test(branchId))
    return err({ code: 'invalid_input' });
  try {
    return ok(await getRateSheet(session.userId, branchId, getDb()));
  } catch (error) {
    logger.error({ err: error }, 'rate sheet failed');
    return err({ code: 'internal' });
  }
}
