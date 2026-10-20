import { cacheLife } from 'next/cache';

export async function currentYear(): Promise<number> {
  'use cache';
  cacheLife('days');
  return new Date().getFullYear();
}
