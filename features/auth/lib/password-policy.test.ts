import { describe, expect, it } from 'vitest';
import { checkPassword } from './password-policy';

describe('checkPassword (D2)', () => {
  it('accepts a long, uncommon password', () => {
    expect(checkPassword('irani chai at dawn', 'guest@example.com')).toBeNull();
  });

  it('rejects short, overlong, common, repetitive and email-based passwords', () => {
    expect(checkPassword('short1')).toBe('too_short');
    expect(checkPassword('a'.repeat(129))).toBe('too_long');
    expect(checkPassword('Password123')).toBe('common');
    expect(checkPassword('Hyderabad@123')).toBe('common');
    expect(checkPassword('abababababab')).toBe('repetitive');
    expect(checkPassword('ravi.kumar-2026!', 'ravi.kumar@example.com')).toBe('contains_email');
  });

  it('ignores very short email names', () => {
    expect(checkPassword('abc tiffins every day', 'abc@example.com')).toBeNull();
  });
});
