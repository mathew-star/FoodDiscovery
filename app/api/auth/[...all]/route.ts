import { handleAuthRequest } from '@/features/auth/server/handler';

export function GET(request: Request): Promise<Response> {
  return handleAuthRequest(request);
}

export function POST(request: Request): Promise<Response> {
  return handleAuthRequest(request);
}
