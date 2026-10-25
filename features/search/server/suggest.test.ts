import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
const limit = vi.fn();
vi.mock('@/infra/ratelimit', () => ({ limit: (...args: unknown[]) => limit(...args) }));
const getCity = vi.fn();
vi.mock('@/features/geo/queries/geo', () => ({ getCity: (...args: unknown[]) => getCity(...args) }));
const getSuggestions = vi.fn();
vi.mock('../queries/search', () => ({ getSuggestions: (...args: unknown[]) => getSuggestions(...args) }));

const { handleSuggest } = await import('./suggest');

const get = (query: string) => new NextRequest(`http://localhost:3000/api/search/suggest?${query}`);
const suggestion = { kind: 'ranking', label: 'Chicken Dum Biryani', detail: null, href: '/hyderabad/dish/x' };

beforeEach(() => {
  limit.mockReset().mockResolvedValue({ allowed: true, remaining: 1, retryAfterMs: 0 });
  getCity.mockReset().mockResolvedValue({ id: 'city-1', slug: 'hyderabad' });
  getSuggestions.mockReset().mockResolvedValue([suggestion]);
});

describe('handleSuggest', () => {
  it('returns suggestions for a normalised query', async () => {
    const response = await handleSuggest(get('city=hyderabad&q=%20BIRYANI%20'));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ suggestions: [suggestion] });
    expect(getSuggestions).toHaveBeenCalledWith('city-1', 'hyderabad', 'biryani');
    expect(response.headers.get('cache-control')).toBe('private, max-age=60');
  });

  it('rejects short queries and bad cities without touching the database', async () => {
    expect((await handleSuggest(get('city=hyderabad&q=b'))).status).toBe(400);
    expect((await handleSuggest(get('city=..%2Fx&q=biryani'))).status).toBe(400);
    expect(getSuggestions).not.toHaveBeenCalled();
  });

  it('404s an unknown city and 429s when limited', async () => {
    getCity.mockResolvedValueOnce(null);
    expect((await handleSuggest(get('city=pune&q=biryani'))).status).toBe(404);
    limit.mockResolvedValueOnce({ allowed: false, remaining: 0, retryAfterMs: 2_000 });
    const limited = await handleSuggest(get('city=hyderabad&q=biryani'));
    expect(limited.status).toBe(429);
    expect(limited.headers.get('retry-after')).toBe('2');
  });
});
