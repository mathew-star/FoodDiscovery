'use server';

import { getSession } from '@/features/auth/queries/session';
import { limit } from '@/infra/ratelimit';
import { logger } from '@/infra/logger';
import { err, type Result } from '@/shared/lib/result';
import { onboardingInputSchema } from '../schemas/onboarding';
import { deleteUser } from './repo';
import { completeOnboarding } from './service';

const onboardingPolicy = { name: 'profile:onboarding', limit: 10, windowMs: 60_000 };

/** Order per AGENTS: session → parse → limit → service. */
export async function completeOnboardingAction(input: unknown): Promise<Result<{ username: string }>> {
  const session = await getSession();
  if (!session) return err({ code: 'unauthenticated' });

  const parsed = onboardingInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? 'form');
      fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message];
    }
    return err({ code: 'invalid_input', fieldErrors });
  }

  const decision = await limit(onboardingPolicy, session.userId);
  if (!decision.allowed) {
    return err({ code: 'rate_limited', retryAfterSeconds: Math.ceil(decision.retryAfterMs / 1000) });
  }

  try {
    return await completeOnboarding(session.userId, parsed.data);
  } catch (error) {
    logger.error({ err: error }, 'onboarding failed');
    return err({ code: 'internal' });
  }
}

/** Spec E1-3: under 18 means no account. The user row goes, and its sessions with it (cascade). */
export async function declineUnderageAction(): Promise<Result<null>> {
  const session = await getSession();
  if (!session) return err({ code: 'unauthenticated' });
  try {
    await deleteUser(session.userId);
  } catch (error) {
    logger.error({ err: error }, 'underage account removal failed');
    return err({ code: 'internal' });
  }
  return { ok: true, data: null };
}
