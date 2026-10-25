import 'server-only';

import { createHash } from 'node:crypto';

/*
  Rate-limit key for the caller's IP. Vercel overwrites x-forwarded-for with the client address, so
  its first entry is trusted there. Hashed so raw IPs never reach Redis or logs.
*/
export function clientIpKey(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || headers.get('x-real-ip')?.trim() || 'unknown';
  return createHash('sha256').update(ip).digest('hex').slice(0, 32);
}
