import type * as NextServer from 'next/server';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/infra/logger', () => ({ logger: { error: vi.fn() } }));

const limit = vi.fn();
vi.mock('@/infra/ratelimit', () => ({ limit: (...args: unknown[]) => limit(...args) }));
const insertAnalyticsEvents = vi.fn();
vi.mock('./repo', () => ({ insertAnalyticsEvents: (...args: unknown[]) => insertAnalyticsEvents(...args) }));
const afterCallbacks: Array<() => Promise<void>> = [];
vi.mock('next/server', async (importOriginal) => ({
  ...(await importOriginal<typeof NextServer>()),
  after: (callback: () => Promise<void>) => afterCallbacks.push(callback),
}));

const { ingestEvents, deviceCookieName } = await import('./ingest');

const branchId = '01920000-0000-7000-8000-0000000000aa';
const deviceId = '01920000-0000-7000-8000-000000000001';
const event = { name: 'directions_click', branchId, surface: 'branch' };

function request(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost:3000/api/events', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { host: 'localhost:3000', 'sec-fetch-site': 'same-origin', ...headers },
  });
}

beforeEach(() => {
  limit.mockReset().mockResolvedValue({ allowed: true, remaining: 10, retryAfterMs: 0 });
  insertAnalyticsEvents.mockReset().mockResolvedValue(undefined);
  afterCallbacks.length = 0;
});

describe('ingestEvents', () => {
  it('accepts a valid batch, issues a device cookie and inserts after the response', async () => {
    const response = await ingestEvents(request({ events: [event] }));
    expect(response.status).toBe(204);
    const cookie = response.headers.get('set-cookie') ?? '';
    expect(cookie).toMatch(new RegExp(`^${deviceCookieName}=[0-9a-f-]{36}; Path=/;`));
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(insertAnalyticsEvents).not.toHaveBeenCalled();

    await afterCallbacks[0]?.();
    expect(insertAnalyticsEvents).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'directions_click',
        branchId,
        props: { surface: 'branch' },
        userId: null,
      }),
    ]);
  });

  it('reuses a valid device cookie', async () => {
    const response = await ingestEvents(
      request({ events: [event] }, { cookie: `${deviceCookieName}=${deviceId}` }),
    );
    expect(response.headers.get('set-cookie')).toBeNull();
    expect(limit).toHaveBeenCalledWith(expect.objectContaining({ name: 'events:device' }), deviceId);
    await afterCallbacks[0]?.();
    expect(insertAnalyticsEvents).toHaveBeenCalledWith([expect.objectContaining({ deviceId })]);
  });

  it('rejects cross-site and origin-less requests', async () => {
    expect(
      (await ingestEvents(request({ events: [event] }, { 'sec-fetch-site': 'cross-site' }))).status,
    ).toBe(403);
    const noFetchSite = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: JSON.stringify({ events: [event] }),
      headers: { host: 'localhost:3000' },
    });
    expect((await ingestEvents(noFetchSite)).status).toBe(403);
  });

  it('accepts a matching Origin when Sec-Fetch-Site is absent', async () => {
    const legacy = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: JSON.stringify({ events: [event] }),
      headers: { host: 'localhost:3000', origin: 'http://localhost:3000' },
    });
    expect((await ingestEvents(legacy)).status).toBe(204);
  });

  it('rejects oversized, malformed and unknown payloads', async () => {
    expect((await ingestEvents(request('x'.repeat(5000)))).status).toBe(413);
    expect((await ingestEvents(request('{not json'))).status).toBe(400);
    expect((await ingestEvents(request({ events: [{ name: 'rate_submit' }] }))).status).toBe(400);
    expect((await ingestEvents(request({ events: [{ ...event, extra: 'smuggled' }] }))).status).toBe(400);
    expect(afterCallbacks).toHaveLength(0);
  });

  it('returns 429 with Retry-After when limited', async () => {
    limit.mockResolvedValueOnce({ allowed: false, remaining: 0, retryAfterMs: 1_500 });
    const response = await ingestEvents(request({ events: [event] }));
    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('2');
    expect(afterCallbacks).toHaveLength(0);
  });
});
