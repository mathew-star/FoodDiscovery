import { describe, expect, it } from 'vitest';
import { normalizeSearchQuery, searchParamsSchema, suggestParamsSchema } from './search-params';

describe('searchParamsSchema', () => {
  it('normalises the query and drops empty ones', () => {
    expect(searchParamsSchema.parse({ q: '  Mutton   HALEEM ' }).q).toBe('mutton haleem');
    expect(searchParamsSchema.parse({ q: '   ' }).q).toBeNull();
    expect(searchParamsSchema.parse({}).q).toBeNull();
    expect(searchParamsSchema.parse({ q: ['first', 'second'] }).q).toBe('first');
  });

  it('keeps known chips once, from repeated or comma-separated params', () => {
    expect(searchParamsSchema.parse({ chip: ['open-now', 'veg', 'open-now', 'bogus'] }).chip).toEqual([
      'open-now',
      'veg',
    ]);
    expect(searchParamsSchema.parse({ chip: 'under-300,late-night' }).chip).toEqual([
      'under-300',
      'late-night',
    ]);
    expect(searchParamsSchema.parse({}).chip).toEqual([]);
  });

  it('parses filters and drops invalid ones', () => {
    expect(
      searchParamsSchema.parse({ area: 'old-city', diet: 'egg', price: '2', km: '3', cuisine: 'arabian' }),
    ).toMatchObject({
      area: 'old-city',
      diet: 'egg',
      price: 2,
      km: 3,
      cuisine: 'arabian',
    });
    expect(searchParamsSchema.parse({ area: '../x', diet: 'vegan', price: '9', km: '4' })).toMatchObject({
      area: undefined,
      diet: undefined,
      price: undefined,
      km: undefined,
    });
  });

  it('caps query length', () => {
    expect(normalizeSearchQuery('a'.repeat(120))).toHaveLength(80);
  });
});

describe('suggestParamsSchema', () => {
  it('needs two characters and a slug-shaped city', () => {
    expect(suggestParamsSchema.safeParse({ city: 'hyderabad', q: ' b ' }).success).toBe(false);
    expect(suggestParamsSchema.parse({ city: 'hyderabad', q: ' BI ' })).toEqual({
      city: 'hyderabad',
      q: 'bi',
    });
    expect(suggestParamsSchema.safeParse({ city: '../x', q: 'biryani' }).success).toBe(false);
  });
});
