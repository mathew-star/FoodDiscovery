import { describe, expect, it } from 'vitest';
import { parseQueryIntents } from './query-intents';

const areas = [
  { slug: 'old-city', name: 'Old City' },
  { slug: 'banjara-hills', name: 'Banjara Hills' },
  { slug: 'madhapur', name: 'Madhapur' },
];

describe('parseQueryIntents', () => {
  it('turns typed filters into chips and keeps the food words', () => {
    expect(parseQueryIntents('irani chai open now', areas)).toEqual({
      text: 'irani chai',
      chips: ['open-now'],
      area: null,
    });
    expect(parseQueryIntents('biryani under ₹300', areas)).toEqual({
      text: 'biryani',
      chips: ['under-300'],
      area: null,
    });
    expect(parseQueryIntents('biryani under rs 300', areas).chips).toEqual(['under-300']);
    expect(parseQueryIntents('paya after midnight', areas)).toEqual({
      text: 'paya',
      chips: ['late-night'],
      area: null,
    });
    expect(parseQueryIntents('rainy day mirchi bajji', areas)).toEqual({
      text: 'mirchi bajji',
      chips: ['rainy-day'],
      area: null,
    });
  });

  it('extracts a known area after near/in', () => {
    expect(parseQueryIntents('mutton haleem near old city', areas)).toEqual({
      text: 'mutton haleem',
      chips: [],
      area: 'old-city',
    });
    expect(parseQueryIntents('dosa in banjara hills open now', areas)).toEqual({
      text: 'dosa',
      chips: ['open-now'],
      area: 'banjara-hills',
    });
  });

  it('leaves plain queries and unknown areas alone', () => {
    expect(parseQueryIntents('haleem', areas)).toEqual({ text: 'haleem', chips: [], area: null });
    expect(parseQueryIntents('kebab near tolichowki', areas).text).toBe('kebab near tolichowki');
  });

  it('can leave no text when the query is all filters', () => {
    expect(parseQueryIntents('open now near me', areas)).toEqual({
      text: '',
      chips: ['open-now', 'within-3km'],
      area: null,
    });
  });
});
