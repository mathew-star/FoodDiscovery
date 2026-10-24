import { describe, expect, it } from 'vitest';
import { brands, canonicalDishes, localities } from '@/db/seed/catalogue';
import { area, chaiList, haleemBoard, places, proofSets } from './content';

const seededBranchSlugs = new Set(
  brands.flatMap((brand) => brand.branches.map((branch) => `${brand.slug}-${branch.locality}`)),
);
const seededDishSlugs = new Set(canonicalDishes.map((dish) => dish.slug));

describe('landing demo content points at seeded pages', () => {
  it.each(Object.entries(places))('%s is a seeded branch', (_, place) => {
    expect(seededBranchSlugs.has(place.slug)).toBe(true);
  });

  it('links city dish rankings that exist', () => {
    const routes = [...Object.values(proofSets).map((set) => set.route), haleemBoard.route, chaiList.route];
    for (const route of routes.filter((path) => path.startsWith('/hyderabad/dish/'))) {
      expect(seededDishSlugs.has(route.replace('/hyderabad/dish/', ''))).toBe(true);
    }
  });

  it('uses a seeded locality for the area preview', () => {
    expect(localities.some((locality) => locality.slug === area.slug)).toBe(true);
  });
});
