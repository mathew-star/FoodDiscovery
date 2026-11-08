import 'server-only';

import { isUniqueViolation } from '@/db/errors';
import { getRankingConfig } from '@/features/ratings/queries/ranking-config';
import { logger } from '@/infra/logger';
import { err, ok, type Result } from '@/shared/lib/result';
import { evaluateTrust } from '../lib/trust';
import type { OnboardingInput } from '../schemas/onboarding';
import {
  countKnownCuisines,
  findLocalityId,
  isUsernameTaken,
  listTrustFacts,
  updateTrustLevel,
  upsertOnboardedProfile,
} from './repo';

const usernameTaken = () =>
  err({ code: 'conflict' as const, fieldErrors: { username: ['profile.errors.usernameTaken'] } });

/** Spec E1-3: one screen; only the 18+ confirmation and a free username are required. */
export async function completeOnboarding(
  userId: string,
  input: OnboardingInput,
): Promise<Result<{ username: string }>> {
  if (await isUsernameTaken(input.username, userId)) return usernameTaken();
  const [knownCuisines, homeLocalityId] = await Promise.all([
    countKnownCuisines(input.cuisines),
    input.homeLocality ? findLocalityId(input.homeLocality) : Promise.resolve(null),
  ]);
  if (knownCuisines !== input.cuisines.length || (input.homeLocality && !homeLocalityId)) {
    return err({ code: 'invalid_input' });
  }
  try {
    await upsertOnboardedProfile({
      userId,
      username: input.username,
      displayName: input.displayName,
      diet: input.diet,
      cuisines: input.cuisines,
      homeLocalityId,
    });
  } catch (error) {
    if (isUniqueViolation(error, 'profiles_username_key')) return usernameTaken();
    throw error;
  }
  return ok({ username: input.username });
}

/** Spec §2.2, nightly: moves members between T0, T1 and T2. Returns how many changed. */
export async function recomputeTrustLevels(): Promise<{ members: number; changed: number }> {
  const rules = await getRankingConfig('trust_rules');
  const members = await listTrustFacts();
  let changed = 0;
  for (const member of members) {
    const next = evaluateTrust(
      { ...member, upheldReports: 0, factConfirmations: 0, factAgreements: 0 },
      rules,
    );
    if (next === member.current) continue;
    await updateTrustLevel(member.userId, next);
    changed += 1;
  }
  logger.info({ members: members.length, changed }, 'trust levels recomputed');
  return { members: members.length, changed };
}
