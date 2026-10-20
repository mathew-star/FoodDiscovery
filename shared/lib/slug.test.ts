import { describe, expect, it } from 'vitest';
import { branchSlug, slugify, uniqueSlug } from './slug';

describe('slugify', () => {
  it.each([
    ['Pista House', 'pista-house'],
    ['Haleem & Ramzan', 'haleem-and-ramzan'],
    ['  Noor-e-Deccan  Kitchen ', 'noor-e-deccan-kitchen'],
    ['Crème brûlée', 'creme-brulee'],
    ['Hitech Biryani Co.', 'hitech-biryani-co'],
  ])('%s → %s', (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});

describe('uniqueSlug', () => {
  it('appends -2, -3 on collision', () => {
    expect(uniqueSlug('haleem', new Set())).toBe('haleem');
    expect(uniqueSlug('haleem', new Set(['haleem']))).toBe('haleem-2');
    expect(uniqueSlug('haleem', new Set(['haleem', 'haleem-2']))).toBe('haleem-3');
  });
});

it('builds spec branch slugs', () => {
  expect(branchSlug('pista-house', 'shalibanda', new Set())).toBe('pista-house-shalibanda');
  expect(branchSlug('pista-house', 'shalibanda', new Set(['pista-house-shalibanda']))).toBe(
    'pista-house-shalibanda-2',
  );
});
