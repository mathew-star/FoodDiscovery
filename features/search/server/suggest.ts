import 'server-only';

import type { NextRequest } from 'next/server';
import { getCity } from '@/features/geo/queries/geo';
import { clientIpKey } from '@/infra/client-ip';
import { limit, type RateLimitPolicy } from '@/infra/ratelimit';
import { getSuggestions } from '../queries/search';
import { suggestParamsSchema } from '../schemas/search-params';

// A guest typing fast sends one request per pause; this leaves room for a shared NAT.
const suggestPolicy: RateLimitPolicy = { name: 'suggest:ip', limit: 300, windowMs: 60_000 };

export async function handleSuggest(request: NextRequest): Promise<Response> {
  const parsed = suggestParamsSchema.safeParse({
    city: request.nextUrl.searchParams.get('city') ?? '',
    q: request.nextUrl.searchParams.get('q') ?? '',
  });
  if (!parsed.success) return Response.json({ suggestions: [] }, { status: 400 });

  const decision = await limit(suggestPolicy, clientIpKey(request.headers));
  if (!decision.allowed) {
    return Response.json(
      { suggestions: [] },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(decision.retryAfterMs / 1000)) } },
    );
  }

  const city = await getCity(parsed.data.city);
  if (!city) return Response.json({ suggestions: [] }, { status: 404 });

  const suggestions = await getSuggestions(city.id, city.slug, parsed.data.q);
  return Response.json({ suggestions }, { headers: { 'Cache-Control': 'private, max-age=60' } });
}
