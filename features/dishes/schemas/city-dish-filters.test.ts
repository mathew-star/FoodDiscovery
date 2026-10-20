import { describe, expect, it } from 'vitest';
import { cityDishFiltersSchema } from './city-dish-filters';

describe('cityDishFiltersSchema', () => {
  it('parses valid filters', () => {
    expect(cityDishFiltersSchema.parse({ area: 'old-city', maxPrice: '300', open: '1' })).toEqual({
      area: 'old-city',
      maxPrice: 300,
      open: '1',
    });
  });

  it('drops invalid values instead of failing the page', () => {
    expect(cityDishFiltersSchema.parse({ area: '../etc', maxPrice: '299', open: 'yes' })).toEqual({
      area: undefined,
      maxPrice: undefined,
      open: undefined,
    });
  });

  it('takes the first of repeated params', () => {
    expect(cityDishFiltersSchema.parse({ area: ['madhapur', 'abids'] }).area).toBe('madhapur');
  });
});
