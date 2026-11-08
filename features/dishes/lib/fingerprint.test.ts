import { describe, expect, it } from 'vitest';
import { cleanDishName, fingerprintDish } from './fingerprint';

const fp = (name: string, protectedNames?: ReadonlySet<string>) =>
  fingerprintDish(name, protectedNames).fingerprint;

describe('fingerprintDish (docs/CONTRIBUTIONS.md §5.1, Flow F)', () => {
  it('joins portion, spelling and order variants of one dish', () => {
    for (const name of [
      'Chicken Biryani',
      'Chk Biryani (Single)',
      'Chicken biriyani',
      'Full Plate Chicken Biryani',
      'biryani, chicken',
    ]) {
      expect(fp(name), name).toBe('biryani_chicken');
    }
  });

  it('keeps variant words apart', () => {
    expect(fp('Chicken Fry Piece Biryani')).toBe('biryani_chicken_fry');
    expect(fp('Chicken Dum Biryani')).toBe('biryani_chicken_dum');
    expect(fp('Special Chicken Biryani')).toBe('biryani_chicken_special');
    expect(fp('Boneless Chicken Biryani')).toBe('biryani_boneless_chicken');
  });

  it('drops small counts but keeps numbers that name a dish', () => {
    expect(fp('Osmania Biscuit (4 pcs)')).toBe('biscuit_osmania');
    expect(fp('Chicken 65')).toBe('65_chicken');
    expect(fp('Chk 65 half')).toBe('65_chicken');
    expect(fp('Mutton Mandi (2 persons)')).toBe('mandi_mutton');
  });

  it('keeps every word of a protected canonical name', () => {
    const canon = new Set([cleanDishName('Double ka Meetha')]);
    expect(fp('Double ka Meetha', canon)).toBe('double_ka_meetha');
    expect(fp('Double ka Meetha')).toBe('ka_meetha');
  });

  it('never returns an empty fingerprint', () => {
    expect(fp('Full plate')).toBe('full_plate');
    expect(fingerprintDish('Crème Brûlée').normalizedName).toBe('creme brulee');
  });
});
