import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ cacheLife: () => undefined, cacheTag: () => undefined }));
vi.mock('@/features/ratings/queries/ranking-config', () => ({ getRankingConfig: vi.fn() }));
vi.mock('../server/repo', () => ({}));
vi.mock('@/shared/lib/time', () => ({ daysBetween: () => 0 }));

const { buildBranchMenu } = await import('./dishes');
type Dish = Parameters<typeof buildBranchMenu>[0][number];

const config = { minWeightForWhatToOrder: 2, whatToOrderLimit: 5, whatToOrderMinQualified: 3 };

function dish(overrides: Partial<Dish> & Pick<Dish, 'id'>): Dish {
  return {
    slug: overrides.id,
    name: overrides.id,
    description: null,
    menuSection: 'Mains',
    pricePaise: 10_000,
    diet: 'veg',
    isJain: false,
    isSignature: false,
    score: null,
    lovedPct: null,
    ratingCount: 0,
    weightSum: 0,
    lastRatedAt: null,
    canonicalDishId: null,
    ...overrides,
  };
}

describe('buildBranchMenu', () => {
  it('ranks qualified dishes by score then rating count, capped at five', () => {
    const dishes = Array.from({ length: 7 }, (_, index) =>
      dish({ id: `d${index}`, score: 0.5 + index * 0.05, weightSum: 10, ratingCount: index }),
    );
    const { whatToOrder } = buildBranchMenu(dishes, config);
    expect(whatToOrder.map((entry) => entry.dish.id)).toEqual(['d6', 'd5', 'd4', 'd3', 'd2']);
    expect(whatToOrder.every((entry) => !entry.knownFor)).toBe(true);
  });

  it('skips dishes below the weight threshold', () => {
    const { whatToOrder } = buildBranchMenu(
      [dish({ id: 'thin', score: 0.99, weightSum: 1.5 }), dish({ id: 'ok', score: 0.6, weightSum: 4 })],
      config,
    );
    expect(whatToOrder.map((entry) => entry.dish.id)).toEqual(['ok']);
  });

  it('fills with signature dishes marked Known for when fewer than three qualify', () => {
    const { whatToOrder } = buildBranchMenu(
      [
        dish({ id: 'rated', score: 0.8, weightSum: 5 }),
        dish({ id: 'sig', isSignature: true }),
        dish({ id: 'plain' }),
      ],
      config,
    );
    expect(whatToOrder).toEqual([
      expect.objectContaining({ knownFor: false, dish: expect.objectContaining({ id: 'rated' }) }),
      expect.objectContaining({ knownFor: true, dish: expect.objectContaining({ id: 'sig' }) }),
    ]);
  });

  it('groups by menu section with unrated dishes last', () => {
    const { sections } = buildBranchMenu(
      [
        dish({ id: 'new', menuSection: 'Biryani' }),
        dish({ id: 'top', menuSection: 'Biryani', score: 0.7, weightSum: 9 }),
        dish({ id: 'sweet', menuSection: 'Desserts', score: 0.6, weightSum: 3 }),
      ],
      config,
    );
    expect(sections.map((section) => [section.name, section.dishes.map((entry) => entry.id)])).toEqual([
      ['Biryani', ['top', 'new']],
      ['Desserts', ['sweet']],
    ]);
  });
});
