import { describe, expect, it } from 'vitest';
import { isReservedUsername, usernameBase, usernamePattern } from './username';

describe('usernameBase', () => {
  it('derives a valid handle from a display name', () => {
    expect(usernameBase('Asha Rao')).toBe('asha_rao');
    expect(usernameBase('  Zoë  Fernandes!! ')).toBe('zoe_fernandes');
    expect(usernameBase('Muhammad Abdul Qadeer Siddiqui')).toBe('muhammad_abdul_q');
  });

  it('falls back when the name is too short, non-Latin or reserved', () => {
    expect(usernameBase('Al')).toBe('al_eats');
    expect(usernameBase('రవి')).toBe('foodie_eats');
    expect(usernameBase('Admin')).toBe('admin_eats');
    for (const name of ['Al', 'రవి', 'Admin', 'Asha Rao'])
      expect(usernameBase(name)).toMatch(usernamePattern);
  });
});

it('reserves staff-like names', () => {
  expect(isReservedUsername('admin')).toBe(true);
  expect(isReservedUsername('fdn_anything')).toBe(true);
  expect(isReservedUsername('asha_rao')).toBe(false);
});
