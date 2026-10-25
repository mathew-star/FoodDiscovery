import type { LatLng } from '@/shared/lib/geo';

export const deviceLocationStorageKey = 'fdn:location';
// A phone moves; an old fix makes distances lie, so it is re-asked after this long.
export const deviceLocationMaxAgeMs = 6 * 60 * 60 * 1000;

export type StoredLocation = LatLng & { at: number };

export function parseStoredLocation(raw: string | null, now: number): LatLng | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return null;
    const { lat, lng, at } = value as Record<string, unknown>;
    if (typeof lat !== 'number' || typeof lng !== 'number' || typeof at !== 'number') return null;
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180 || now - at > deviceLocationMaxAgeMs || at > now)
      return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

/** ~110 m precision is enough for "1.2 km away" and keeps less of the guest's position. */
export function coarsen({ lat, lng }: LatLng): LatLng {
  return { lat: Math.round(lat * 1_000) / 1_000, lng: Math.round(lng * 1_000) / 1_000 };
}
