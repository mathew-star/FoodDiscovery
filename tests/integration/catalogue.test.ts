import { beforeAll, describe, expect, it, vi } from 'vitest';
import type * as DishesRepo from '@/features/dishes/server/repo';
import type * as PlacesRepo from '@/features/places/server/repo';

vi.mock('server-only', () => ({}));

const enabled = process.env.DATABASE_DRIVER === 'pg' && Boolean(process.env.DATABASE_URL);

describe.runIf(enabled)('catalogue repositories (seeded database)', () => {
  let places: typeof PlacesRepo;
  let dishes: typeof DishesRepo;

  beforeAll(async () => {
    places = await import('@/features/places/server/repo');
    dishes = await import('@/features/dishes/server/repo');
  });

  it('loads a branch with cuisines, hours and facts', async () => {
    const branch = await places.findBranchBySlug('deccan-degh-house-old-city');
    expect(branch).toMatchObject({
      name: 'Deccan Degh House',
      localitySlug: 'old-city',
      citySlug: 'hyderabad',
    });
    expect(branch?.cuisines.map((cuisine) => cuisine.slug)).toEqual(['hyderabadi', 'mughlai']);
    expect(branch?.hours).toHaveLength(7);
    expect(branch?.facts.map((fact) => fact.field).sort()).toEqual([
      'address',
      'hours',
      'payment_modes',
      'price_range',
      'veg_only',
    ]);
    expect(branch?.location.lat).toBeGreaterThan(17.3);
  });

  it('returns null for unknown slugs', async () => {
    expect(await places.findBranchBySlug('does-not-exist')).toBeNull();
  });

  it('finds nearby alternatives within the radius, excluding the branch itself', async () => {
    const branch = await places.findBranchBySlug('deccan-degh-house-old-city');
    if (!branch) throw new Error('seed missing');
    const nearby = await places.findNearbyBranches({
      branchId: branch.id,
      location: branch.location,
      cuisineIds: branch.cuisines.map((cuisine) => cuisine.id),
      radiusMeters: 2_000,
      limit: 6,
    });
    expect(nearby.length).toBeGreaterThan(0);
    expect(nearby.every((entry) => entry.id !== branch.id && entry.distanceMeters <= 2_000)).toBe(true);
  });

  it('ranks city dishes with displayable scores before new ones', async () => {
    const canonical = await dishes.findCanonicalDish('mutton-haleem');
    const branch = await places.findBranchBySlug('deccan-degh-house-old-city');
    if (!canonical || !branch) throw new Error('seed missing');
    const ranked = await dishes.listBranchDishesForCanonical(canonical.id, branch.cityId, 3);
    const firstNew = ranked.findIndex((dish) => dish.weightSum < 3);
    const displayable = firstNew === -1 ? ranked : ranked.slice(0, firstNew);
    expect(ranked.slice(displayable.length).every((dish) => dish.weightSum < 3)).toBe(true);
    for (let index = 1; index < displayable.length; index += 1) {
      expect(displayable[index - 1]?.score ?? 0).toBeGreaterThanOrEqual(displayable[index]?.score ?? 0);
    }
  });

  it('exposes every active branch dish for static params', async () => {
    const params = await dishes.listBranchDishParams();
    expect(params.length).toBeGreaterThanOrEqual(100);
    expect(params).toContainEqual({ branch: 'noor-e-deccan-kitchen-old-city', dish: 'mutton-haleem' });
  });
});
