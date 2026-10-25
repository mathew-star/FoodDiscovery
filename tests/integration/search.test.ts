import { beforeAll, describe, expect, it, vi } from 'vitest';
import type * as SearchRepo from '@/features/search/server/repo';

vi.mock('server-only', () => ({}));

const enabled = process.env.DATABASE_DRIVER === 'pg' && Boolean(process.env.DATABASE_URL);
const limits = { dishLimit: 60, branchLimit: 10, groupLimit: 6 };
const threshold = 0.45;

describe.runIf(enabled)('search repository (seeded database)', () => {
  let repo: typeof SearchRepo;
  let cityId: string;

  beforeAll(async () => {
    repo = await import('@/features/search/server/repo');
    const geo = await import('@/features/geo/server/repo');
    const city = await geo.findCityBySlug('hyderabad');
    if (!city) throw new Error('seed missing');
    cityId = city.id;
  });

  it('finds dishes through canonical names despite a typo', async () => {
    const result = await repo.searchCatalogue(cityId, 'biriyani', threshold, limits);
    expect(result.rankings.map((ranking) => ranking.slug)).toContain('chicken-dum-biryani');
    expect(result.dishes.length).toBeGreaterThan(3);
    expect(result.dishes.every((dish) => dish.categorySlug === 'biryani' || /biry/i.test(dish.name))).toBe(true);
    expect(result.dishes[0]?.textRank).toBeGreaterThan(0.45);
  });

  it('ignores accents and case', async () => {
    const result = await repo.searchCatalogue(cityId, 'HALÉEM', threshold, limits);
    expect(result.dishes.some((dish) => dish.canonicalSlug === 'mutton-haleem')).toBe(true);
  });

  it('matches restaurants, areas and cuisines', async () => {
    expect((await repo.searchCatalogue(cityId, 'kebab karkhana', threshold, limits)).branches[0]?.slug).toMatch(
      /^kebab-karkhana-/,
    );
    expect((await repo.searchCatalogue(cityId, 'madhapur', threshold, limits)).areas[0]?.slug).toBe('madhapur');
    expect((await repo.searchCatalogue(cityId, 'arabian', threshold, limits)).cuisines[0]?.slug).toBe('arabian');
  });

  it('returns nothing for gibberish', async () => {
    const result = await repo.searchCatalogue(cityId, 'zzqxv', threshold, limits);
    expect([result.dishes, result.branches, result.areas, result.cuisines, result.rankings].flat()).toHaveLength(0);
  });

  it('lists browse candidates best first with chip fields', async () => {
    const rows = await repo.listBrowseCandidates(cityId, 200);
    expect(rows.length).toBe(100);
    expect(rows[0]).toMatchObject({ textRank: 0, branchTags: expect.any(Array) });
    expect(rows.some((row) => row.branchTags.includes('date-night'))).toBe(true);
  });

  it('counts recent actions per dish and branch', async () => {
    const rows = await repo.listBrowseCandidates(cityId, 1);
    const counts = await repo.countRecentActions([rows[0]?.id ?? ''], [rows[0]?.branchId ?? ''], 7);
    expect(counts).toEqual({ saves: [], directions: [] });
  });
});
