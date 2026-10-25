import { describe, expect, it } from 'vitest';
import { toAnalyticsRow } from './rows';

const actor = { deviceId: '01920000-0000-7000-8000-000000000001', userId: null };
const branchId = '01920000-0000-7000-8000-0000000000aa';

describe('toAnalyticsRow', () => {
  it('lifts entity ids into columns and keeps the rest as props', () => {
    expect(toAnalyticsRow({ name: 'directions_click', branchId, surface: 'branch' }, actor)).toEqual({
      name: 'directions_click',
      ...actor,
      branchId,
      branchDishId: null,
      props: { surface: 'branch' },
    });
  });

  it('keeps events without entities whole', () => {
    expect(
      toAnalyticsRow({ name: 'search', query: 'haleem', resultCount: 4, chips: ['open-now'] }, actor),
    ).toEqual({
      name: 'search',
      ...actor,
      branchId: null,
      branchDishId: null,
      props: { query: 'haleem', resultCount: 4, chips: ['open-now'] },
    });
  });
});
