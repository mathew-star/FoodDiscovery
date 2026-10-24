'use client';

import { useState, useSyncExternalStore } from 'react';
import { getOpenStatus, type HoursRow } from '@/features/places/lib/opening-hours';
import { t } from '@/i18n';
import { formatRupees } from '@/shared/lib/money';
import { Badge } from '@/shared/ui/badge';
import { ChipButton } from '@/shared/ui/chip';
import { useVegOnly } from '../hooks/use-veg-only';
import type { PlacedDish } from '../queries/dishes';
import { priceCaps, type CityDishFilters } from '../schemas/city-dish-filters';
import { LeaderboardList, PlacedDishRow } from './placed-dish-row';

type CityDishBoardProps = {
  dishes: PlacedDish[];
  hours: Record<string, HoursRow[]>;
  timezone: string;
  areas: { slug: string; name: string }[];
  initial: CityDishFilters;
  path: string;
  minWeightForDisplay: number;
};

function subscribeMinute(callback: () => void) {
  const id = window.setInterval(callback, 60_000);
  return () => window.clearInterval(id);
}

let minuteSnapshot = 0;
function readMinute() {
  const minute = Math.floor(Date.now() / 60_000);
  if (minute !== minuteSnapshot) minuteSnapshot = minute;
  return minuteSnapshot;
}

function syncUrl(path: string, filters: CityDishFilters) {
  const params = new URLSearchParams();
  if (filters.area) params.set('area', filters.area);
  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  if (filters.open) params.set('open', '1');
  const query = params.toString();
  window.history.replaceState(null, '', query ? `${path}?${query}` : path);
}

export function CityDishBoard({
  dishes,
  hours,
  timezone,
  areas,
  initial,
  path,
  minWeightForDisplay,
}: CityDishBoardProps) {
  const [filters, setFilters] = useState<CityDishFilters>(initial);
  const vegOnly = useVegOnly();
  const minute = useSyncExternalStore(subscribeMinute, readMinute, () => null);
  const now = minute === null ? null : new Date(minute * 60_000);

  const update = (next: Partial<CityDishFilters>) => {
    const merged = { ...filters, ...next };
    setFilters(merged);
    syncUrl(path, merged);
  };

  const statusFor = (branchId: string) => (now ? getOpenStatus(hours[branchId] ?? [], now, timezone) : null);

  const visible = dishes.filter((dish) => {
    if (vegOnly && dish.diet !== 'veg') return false;
    if (filters.area && dish.localitySlug !== filters.area) return false;
    if (filters.maxPrice && (dish.pricePaise === null || dish.pricePaise > filters.maxPrice * 100))
      return false;
    if (filters.open && now && getOpenStatus(hours[dish.branchId] ?? [], now, timezone).state !== 'open')
      return false;
    return true;
  });

  const presentAreas = areas.filter((area) => dishes.some((dish) => dish.localitySlug === area.slug));
  const filtered = Boolean(filters.area || filters.maxPrice || filters.open);
  const emptyMessage =
    dishes.length === 0
      ? t('dish.cityEmpty')
      : vegOnly && !filtered
        ? t('dish.vegEmpty')
        : t('dish.noMatches');

  return (
    <div className="flex flex-col gap-5">
      <div role="group" aria-label={t('dish.filters')} className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-xs text-inkMuted">{t('dish.filterArea')}</span>
          <ChipButton selected={!filters.area} onClick={() => update({ area: undefined })}>
            {t('dish.filterAnyArea')}
          </ChipButton>
          {presentAreas.map((area) => (
            <ChipButton
              key={area.slug}
              selected={filters.area === area.slug}
              onClick={() => update({ area: area.slug })}
            >
              {area.name}
            </ChipButton>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-xs text-inkMuted">{t('dish.filterPrice')}</span>
          <ChipButton selected={!filters.maxPrice} onClick={() => update({ maxPrice: undefined })}>
            {t('dish.filterAnyPrice')}
          </ChipButton>
          {priceCaps.map((cap) => (
            <ChipButton
              key={cap}
              selected={filters.maxPrice === cap}
              onClick={() => update({ maxPrice: cap })}
            >
              {t('dish.priceCap', { price: formatRupees(cap * 100) })}
            </ChipButton>
          ))}
          <span
            aria-hidden="true"
            className="mx-1 hidden h-6 border-l-2 border-dashed border-ink/25 sm:block"
          />
          <ChipButton
            selected={Boolean(filters.open)}
            onClick={() => update({ open: filters.open ? undefined : '1' })}
          >
            {t('dish.filterOpenNow')}
          </ChipButton>
          {filtered ? (
            <button
              type="button"
              onClick={() => update({ area: undefined, maxPrice: undefined, open: undefined })}
              className="ml-1 text-xs underline underline-offset-4 hover:text-terracottaDeep"
            >
              {t('dish.clearFilters')}
            </button>
          ) : null}
        </div>
      </div>

      <p className="text-xs text-inkMuted" aria-live="polite">
        {visible.length === 1 ? t('dish.resultsCountOne') : t('dish.resultsCount', { count: visible.length })}
      </p>

      {visible.length === 0 ? (
        <p className="rounded-panel border-2 border-dashed border-ink/40 bg-paper p-6 text-inkMuted">
          {emptyMessage}
        </p>
      ) : (
        <LeaderboardList>
          {visible.map((dish, index) => {
            const status = statusFor(dish.branchId);
            return (
              <li key={dish.id}>
                <PlacedDishRow
                  dish={dish}
                  rank={index + 1}
                  minWeightForDisplay={minWeightForDisplay}
                  showDishName={false}
                  status={
                    status?.state === 'open' ? (
                      <Badge tone="lime">{t('place.openTill', { time: status.closesAt })}</Badge>
                    ) : status?.state === 'closed' ? (
                      <Badge tone="paper">
                        {t('place.closedWithNext', { next: t('place.opensAt', { time: status.opensAt }) })}
                      </Badge>
                    ) : null
                  }
                />
              </li>
            );
          })}
        </LeaderboardList>
      )}
    </div>
  );
}
