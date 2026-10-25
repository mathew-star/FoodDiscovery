import type { NextRequest } from 'next/server';
import { handleSuggest } from '@/features/search/server/suggest';

export function GET(request: NextRequest): Promise<Response> {
  return handleSuggest(request);
}
