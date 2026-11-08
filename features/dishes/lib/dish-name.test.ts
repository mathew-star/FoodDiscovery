import { describe, expect, it } from 'vitest';
import { checkDishName, displayDishName } from './dish-name';

describe('checkDishName', () => {
  it('accepts real dish names', () => {
    for (const name of ['Mutton Marag', 'Chicken 65', 'Qubani ka meetha', 'Idli & vada', 'దోశ']) {
      expect(checkDishName(name), name).toBeNull();
    }
  });

  it('refuses links, contact details, shouting and non-names', () => {
    expect(checkDishName('a')).toBe('too_short');
    expect(checkDishName('x'.repeat(81))).toBe('too_long');
    expect(checkDishName('1234')).toBe('no_letters');
    expect(checkDishName('best biryani www.spam.in')).toBe('link');
    expect(checkDishName('call 98765 43210 for offers')).toBe('contact');
    expect(checkDishName('BEST BIRYANI EVER')).toBe('shouting');
  });
});

it('title-cases for display', () => {
  expect(displayDishName('  mutton   MARAG ')).toBe('Mutton Marag');
  expect(displayDishName('double KA meetha')).toBe('Double ka Meetha');
});
