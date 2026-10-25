import 'server-only';

import { isUniqueViolation } from '@/db/errors';
import { err, ok, type Result } from '@/shared/lib/result';
import type { OnboardingInput } from '../schemas/onboarding';
import { countKnownCuisines, findLocalityId, isUsernameTaken, upsertOnboardedProfile } from './repo';

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
