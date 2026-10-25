import { expect, it } from 'vitest';
import { isUniqueViolation } from './errors';

it('finds a unique violation directly or wrapped', () => {
  const pgError = { code: '23505', constraint: 'profiles_username_key' };
  expect(isUniqueViolation(pgError, 'profiles_username_key')).toBe(true);
  expect(isUniqueViolation(new Error('query failed', { cause: pgError }), 'profiles_username_key')).toBe(
    true,
  );
  expect(isUniqueViolation({ code: '23505', constraint: 'other' }, 'profiles_username_key')).toBe(false);
  expect(isUniqueViolation(new Error('x'), 'profiles_username_key')).toBe(false);
});
