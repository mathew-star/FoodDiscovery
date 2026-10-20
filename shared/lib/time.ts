import { cacheLife } from 'next/cache';

export async function currentYear(): Promise<number> {
  'use cache';
  cacheLife('days');
  return new Date().getFullYear();
}

const DAY_MS = 86_400_000;

export function daysBetween(earlier: Date, later: Date): number {
  return Math.max(0, Math.floor((later.getTime() - earlier.getTime()) / DAY_MS));
}
