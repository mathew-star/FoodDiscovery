'use client';

import { useSyncExternalStore } from 'react';
import {
  LeaderboardList,
  PlacedDishRow,
  type PlacedDishRowData,
} from '@/features/dishes/components/placed-dish-row';
import { LocationBanner } from '@/features/geo/components/location-banner.client';
import { useDeviceLocation } from '@/features/geo/hooks/use-device-location';
import { formatDistanceKm } from '@/features/geo/lib/format-distance';
import { getOpenStatus, type HoursRow } from '@/features/places/lib/opening-hours';
import type { DiscoveryRankingConfig } from '@/features/ratings/schemas/ranking-config';
import { t } from '@/i18n';
import { Badge } from '@/shared/ui/badge';
import type { RankableDish } from '@/features/search/lib/rank-results';
import { pickTrending } from '../lib/trending';

type TrendingProps = {
  cityName: string;
  dishes: (RankableDish & PlacedDishRowData)[];
  hours: Record<string, HoursRow[]>;
  timezone: string;
  config: DiscoveryRankingConfig;
  minWeightForDisplay: number;
};

function subscribeMinute(callback: () => void) {
  const id = window.setInterval(callback, 60_000);
  return () => window.clearInterval(id);
}
const readMinute = () => Math.floor(Date.now() / 60_000);

/** Spec §3.5 / §6.5. Server HTML is the city-wide list; with a shared location it narrows to 5 km. */
export function Trending({ cityName, dishes, hours, timezone, config, minWeightForDisplay }: TrendingProps) {
  const location = useDeviceLocation();
  const minute = useSyncExternalStore(subscribeMinute, readMinute, () => null);
  const now = minute === null ? null : new Date(minute * 60_000);
  const { scope, items } = pickTrending(dishes, { hours, timezone, now, location }, config);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="trending" className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 id="trending" className="type-display-l">
          {scope === 'near' ? t('discover.trendingNear') : t('discover.trendingCity', { city: cityName })}
        </h2>
        <p className="text-inkMuted">{t('discover.trendingBody')}</p>
      </div>
      <LocationBanner />
      <LeaderboardList>
        {items.map(({ dish, distanceKm }, index) => {
          const status = now ? getOpenStatus(hours[dish.branchId] ?? [], now, timezone) : null;
          return (
            <li key={dish.id}>
              <PlacedDishRow
                dish={dish}
                rank={index + 1}
                minWeightForDisplay={minWeightForDisplay}
                status={
                  <>
                    {distanceKm !== null ? (
                      <span className="tabular-nums">· {formatDistanceKm(distanceKm)}</span>
                    ) : null}
                    {status?.state === 'open' ? (
                      <Badge tone="lime">{t('place.openTill', { time: status.closesAt })}</Badge>
                    ) : null}
                  </>
                }
              />
            </li>
          );
        })}
      </LeaderboardList>
    </section>
  );
}
