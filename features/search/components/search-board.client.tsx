'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { track } from '@/features/analytics/lib/track';
import { LeaderboardList, PlacedDishRow } from '@/features/dishes/components/placed-dish-row';
import { useVegOnly } from '@/features/dishes/hooks/use-veg-only';
import { LocationBanner } from '@/features/geo/components/location-banner.client';
import { useDeviceLocation } from '@/features/geo/hooks/use-device-location';
import { formatDistanceKm } from '@/features/geo/lib/format-distance';
import { getOpenStatus, type HoursRow } from '@/features/places/lib/opening-hours';
import type { DiscoveryRankingConfig, SearchConfig } from '@/features/ratings/schemas/ranking-config';
import { t } from '@/i18n';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { ChipButton } from '@/shared/ui/chip';
import { rankDishes } from '../lib/rank-results';
import { hasActiveFilters, matchesFilters } from '../lib/search-filters';
import type { ContextChipId } from '../schemas/context-chips';
import { dietFilterValues, distanceFilterKm, type SearchFilters } from '../schemas/search-params';
import { ContextChips } from './context-chips.client';
import type { SearchDish } from '../queries/search';

const pageSize = 20;
const dietLabel = { veg: 'diet.veg', egg: 'diet.egg', nonveg: 'diet.nonveg' } as const;

type SearchBoardProps = {
  path: string;
  query: string | null;
  dishes: SearchDish[];
  hours: Record<string, HoursRow[]>;
  timezone: string;
  areas: { slug: string; name: string }[];
  config: { discovery: DiscoveryRankingConfig; search: Pick<SearchConfig, 'textWeight' | 'rankWeight'> };
  minWeightForDisplay: number;
  initialChips: ContextChipId[];
  initialFilters: SearchFilters;
};

function subscribeMinute(callback: () => void) {
  const id = window.setInterval(callback, 60_000);
  return () => window.clearInterval(id);
}
const readMinute = () => Math.floor(Date.now() / 60_000);

function syncUrl(
  path: string,
  query: string | null,
  chips: readonly ContextChipId[],
  filters: SearchFilters,
) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  for (const chip of chips) params.append('chip', chip);
  for (const [key, value] of Object.entries(filters)) if (value !== undefined) params.set(key, String(value));
  const search = params.toString();
  window.history.replaceState(null, '', search ? `${path}?${search}` : path);
}

/** Dish results (spec E4-1–E4-3): chips and filters apply in place; nothing refetches. */
export function SearchBoard({
  path,
  query,
  dishes,
  hours,
  timezone,
  areas,
  config,
  minWeightForDisplay,
  initialChips,
  initialFilters,
}: SearchBoardProps) {
  const [chips, setChips] = useState<ContextChipId[]>(initialChips);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [shown, setShown] = useState(pageSize);
  const vegOnly = useVegOnly();
  const location = useDeviceLocation();
  const minute = useSyncExternalStore(subscribeMinute, readMinute, () => null);
  const now = minute === null ? null : new Date(minute * 60_000);

  // One search event per query; later toggles are chip_toggle events.
  const loggedQuery = useRef<string | null>(null);
  useEffect(() => {
    if (!query || loggedQuery.current === query) return;
    loggedQuery.current = query;
    track({ name: 'search', query, resultCount: dishes.length, chips: initialChips });
  }, [query, dishes.length, initialChips]);

  const context = { hours, timezone, now, location };
  const ranked = rankDishes(
    dishes.filter((dish) => (!vegOnly || dish.diet === 'veg') && matchesFilters(dish, filters, location)),
    { chips, context, hasQuery: query !== null, config },
  );
  const visible = ranked.slice(0, shown);
  const needsLocation = !location && (chips.includes('within-3km') || filters.km !== undefined);
  const filtered = chips.length > 0 || hasActiveFilters(filters);

  function update(nextChips: ContextChipId[], nextFilters: SearchFilters) {
    setChips(nextChips);
    setFilters(nextFilters);
    setShown(pageSize);
    syncUrl(path, query, nextChips, nextFilters);
  }

  const setFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) =>
    update(chips, { ...filters, [key]: filters[key] === value ? undefined : value });

  const presentAreas = areas.filter((area) => dishes.some((dish) => dish.localitySlug === area.slug));
  const presentCuisines = [
    ...new Map(
      dishes.flatMap((dish) =>
        dish.cuisineSlug && dish.cuisineName
          ? [[dish.cuisineSlug, { slug: dish.cuisineSlug, name: dish.cuisineName }] as const]
          : [],
      ),
    ).values(),
  ];

  return (
    <section aria-labelledby="dish-results-title" className="flex flex-col gap-4">
      <ContextChips
        surface="search"
        selected={chips}
        onToggle={(chip, on) => update(on ? [...chips, chip] : chips.filter((id) => id !== chip), filters)}
      />

      <details className="group rounded-panel border-2 border-ink bg-paper open:shadow-brutal-sm">
        <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm">
          <span>{t('search.filters.title')}</span>
          <span aria-hidden="true" className="text-lg leading-none transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <div className="flex flex-col gap-3 border-t-2 border-dashed border-ink/25 p-4">
          <FilterRow label={t('search.filters.distance')}>
            {distanceFilterKm.map((km) => (
              <ChipButton key={km} selected={filters.km === km} onClick={() => setFilter('km', km)}>
                {t('search.filters.withinKm', { km })}
              </ChipButton>
            ))}
          </FilterRow>
          <FilterRow label={t('search.filters.price')}>
            {[1, 2, 3, 4].map((band) => (
              <ChipButton
                key={band}
                selected={filters.price === band}
                onClick={() => setFilter('price', band)}
              >
                <span aria-hidden="true">{'₹'.repeat(band)}</span>
                <span className="sr-only">{t('search.filters.priceBand', { band })}</span>
              </ChipButton>
            ))}
          </FilterRow>
          <FilterRow label={t('search.filters.diet')}>
            {dietFilterValues.map((diet) => (
              <ChipButton key={diet} selected={filters.diet === diet} onClick={() => setFilter('diet', diet)}>
                {t(dietLabel[diet])}
              </ChipButton>
            ))}
          </FilterRow>
          {presentAreas.length > 1 ? (
            <FilterRow label={t('search.filters.area')}>
              {presentAreas.map((area) => (
                <ChipButton
                  key={area.slug}
                  selected={filters.area === area.slug}
                  onClick={() => setFilter('area', area.slug)}
                >
                  {area.name}
                </ChipButton>
              ))}
            </FilterRow>
          ) : null}
          {presentCuisines.length > 1 ? (
            <FilterRow label={t('search.filters.cuisine')}>
              {presentCuisines.map((cuisine) => (
                <ChipButton
                  key={cuisine.slug}
                  selected={filters.cuisine === cuisine.slug}
                  onClick={() => setFilter('cuisine', cuisine.slug)}
                >
                  {cuisine.name}
                </ChipButton>
              ))}
            </FilterRow>
          ) : null}
        </div>
      </details>

      {needsLocation ? <LocationBanner /> : null}

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="dish-results-title" className="type-title-m">
          {query ? t('search.dishesTitle') : t('search.browseTitle')}
        </h2>
        <p className="text-xs text-inkMuted" aria-live="polite">
          {ranked.length === 1 ? t('search.dishCountOne') : t('search.dishCount', { count: ranked.length })}
          {filtered ? (
            <>
              {' · '}
              <button
                type="button"
                onClick={() => update([], {})}
                className="underline underline-offset-4 hover:text-terracottaDeep"
              >
                {t('search.clearFilters')}
              </button>
            </>
          ) : null}
        </p>
      </div>

      {ranked.length === 0 ? (
        <p className="rounded-panel border-2 border-dashed border-ink/40 bg-paper p-6 text-inkMuted">
          {dishes.length > 0 && vegOnly && !filtered ? t('dish.vegEmpty') : t('search.filteredEmpty')}
        </p>
      ) : (
        <>
          <LeaderboardList>
            {visible.map(({ dish, distanceKm }, index) => {
              const status = now ? getOpenStatus(hours[dish.branchId] ?? [], now, timezone) : null;
              return (
                <li
                  key={dish.id}
                  onClickCapture={() => {
                    if (query)
                      track({
                        name: 'search_result_click',
                        query,
                        kind: 'dish',
                        position: index,
                        branchId: dish.branchId,
                        branchDishId: dish.id,
                      });
                  }}
                >
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
                        ) : status?.state === 'closed' ? (
                          <Badge tone="paper">
                            {t('place.closedWithNext', {
                              next: t('place.opensAt', { time: status.opensAt }),
                            })}
                          </Badge>
                        ) : null}
                      </>
                    }
                  />
                </li>
              );
            })}
          </LeaderboardList>
          {ranked.length > shown ? (
            <Button
              variant="outline"
              size="sm"
              className="self-center"
              onClick={() => setShown(shown + pageSize)}
            >
              {t('search.showMore', { count: Math.min(pageSize, ranked.length - shown) })}
            </Button>
          ) : null}
        </>
      )}
    </section>
  );
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="w-20 text-xs text-inkMuted">{label}</span>
      {children}
    </div>
  );
}
