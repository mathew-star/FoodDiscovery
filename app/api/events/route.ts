import type { NextRequest } from 'next/server';
import { ingestEvents } from '@/features/analytics/server/ingest';

export function POST(request: NextRequest): Promise<Response> {
  return ingestEvents(request);
}
