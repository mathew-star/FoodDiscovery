import 'server-only';

import { createHash } from 'node:crypto';
import { after, type NextRequest } from 'next/server';
import { logger } from '@/infra/logger';
import { limit, type RateLimitPolicy } from '@/infra/ratelimit';
import { uuidv7 } from '@/shared/lib/uuid';
import { toAnalyticsRow } from '../lib/rows';
import { clientEventBatchSchema } from '../schemas/events';
import { insertAnalyticsEvents } from './repo';

export const deviceCookieName = 'fdn_did';
const deviceCookieMaxAgeSeconds = 400 * 24 * 60 * 60;
const maxBodyBytes = 4096;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// Abuse guards for the beacon itself, not product quotas; a shared NAT gets a wider IP allowance.
const devicePolicy: RateLimitPolicy = { name: 'events:device', limit: 120, windowMs: 60_000 };
const ipPolicy: RateLimitPolicy = { name: 'events:ip', limit: 1200, windowMs: 60_000 };

function empty(status: number, headers?: HeadersInit): Response {
  return new Response(null, { status, headers });
}

function isSameOrigin(request: NextRequest): boolean {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite) return fetchSite === 'same-origin';
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host === request.headers.get('host');
  } catch {
    return false;
  }
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip')?.trim() || 'unknown';
}

const hashKey = (value: string) => createHash('sha256').update(value).digest('hex').slice(0, 32);

export async function ingestEvents(request: NextRequest): Promise<Response> {
  if (!isSameOrigin(request)) return empty(403);

  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (declaredLength > maxBodyBytes) return empty(413);
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > maxBodyBytes) return empty(413);

  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return empty(400);
  }
  const parsed = clientEventBatchSchema.safeParse(json);
  if (!parsed.success) return empty(400);

  const existingDevice = request.cookies.get(deviceCookieName)?.value;
  const deviceId = existingDevice && uuidPattern.test(existingDevice) ? existingDevice : uuidv7();

  for (const [policy, identifier] of [
    [ipPolicy, hashKey(clientIp(request))],
    [devicePolicy, deviceId],
  ] as const) {
    const decision = await limit(policy, identifier);
    if (!decision.allowed)
      return empty(429, { 'Retry-After': String(Math.ceil(decision.retryAfterMs / 1000)) });
  }

  const rows = parsed.data.events.map((event) => toAnalyticsRow(event, { deviceId, userId: null }));
  after(async () => {
    try {
      await insertAnalyticsEvents(rows);
    } catch (error) {
      logger.error({ err: error, count: rows.length }, 'analytics insert failed');
    }
  });

  const response = empty(204);
  if (deviceId !== existingDevice) {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    response.headers.append(
      'Set-Cookie',
      `${deviceCookieName}=${deviceId}; Path=/; Max-Age=${deviceCookieMaxAgeSeconds}; HttpOnly; SameSite=Lax${secure}`,
    );
  }
  return response;
}
