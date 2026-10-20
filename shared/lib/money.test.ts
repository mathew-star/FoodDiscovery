import { expect, it } from 'vitest';
import { formatRupees } from './money';
import { daysBetween } from './time';

it('formats paise as whole rupees with Indian grouping', () => {
  expect(formatRupees(28_000)).toBe('₹280');
  expect(formatRupees(1_25_000_00)).toBe('₹1,25,000');
});

it('counts whole days between dates, never negative', () => {
  expect(daysBetween(new Date('2026-10-01T00:00:00Z'), new Date('2026-10-20T12:00:00Z'))).toBe(19);
  expect(daysBetween(new Date('2026-10-21T00:00:00Z'), new Date('2026-10-20T00:00:00Z'))).toBe(0);
});
