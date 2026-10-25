import { t } from '@/i18n';

/** "350 m away" under a kilometre (rounded to 10 m), "2.4 km away" above. */
export function formatDistanceKm(km: number): string {
  return km < 1
    ? t('place.distanceM', { m: Math.max(10, Math.round(km * 100) * 10) })
    : t('place.distanceKm', { km: km.toFixed(1) });
}
