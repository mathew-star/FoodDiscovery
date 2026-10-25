import { describe, expect, it } from 'vitest';
import { onboardingInputSchema } from './onboarding';

const valid = {
  displayName: 'Asha Rao',
  username: 'Asha_Rao',
  adult: true,
  diet: 'veg',
  cuisines: ['hyderabadi', 'irani-cafe'],
  homeLocality: 'old-city',
};

describe('onboardingInputSchema', () => {
  it('normalises the username', () => {
    expect(onboardingInputSchema.parse(valid).username).toBe('asha_rao');
  });

  it.each([
    [{ adult: false }, 'profile.errors.adult'],
    [{ username: 'ab' }, 'profile.errors.usernameFormat'],
    [{ username: 'asha rao' }, 'profile.errors.usernameFormat'],
    [{ username: 'admin' }, 'profile.errors.usernameReserved'],
    [{ cuisines: ['a', 'b', 'c', 'd', 'e', 'f'] }, 'profile.errors.cuisines'],
    [{ displayName: '   ' }, 'profile.errors.displayName'],
  ])('rejects %j', (override, message) => {
    const result = onboardingInputSchema.safeParse({ ...valid, ...override });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(message);
  });
});
