import { describe, expect, it } from 'vitest';
import { verdictShares } from './verdict-shares';

const sum = (shares: Record<string, number>) => Object.values(shares).reduce((a, b) => a + b, 0);

describe('verdictShares', () => {
  it('returns zeros when nothing is weighted', () => {
    expect(verdictShares({ loved: 0, good: 0, okay: 0, skip: 0 })).toEqual({
      loved: 0,
      good: 0,
      okay: 0,
      skip: 0,
    });
  });

  it('keeps exact percentages', () => {
    expect(verdictShares({ loved: 78, good: 16, okay: 4, skip: 2 })).toEqual({
      loved: 78,
      good: 16,
      okay: 4,
      skip: 2,
    });
  });

  it('always adds up to 100', () => {
    const shares = verdictShares({ loved: 1, good: 1, okay: 1, skip: 0 });
    expect(sum(shares)).toBe(100);
    expect(shares).toEqual({ loved: 34, good: 33, okay: 33, skip: 0 });
  });

  it('ignores negative weights', () => {
    expect(verdictShares({ loved: 3, good: -1, okay: 1, skip: 0 })).toEqual({
      loved: 75,
      good: 0,
      okay: 25,
      skip: 0,
    });
  });
});
