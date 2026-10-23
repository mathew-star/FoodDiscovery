'use client';

import { AnimatePresence, LayoutGroup, m } from 'motion/react';
import Link from 'next/link';
import { MapPin, MoonStar } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { getOpenStatus, type HoursRow } from '@/features/places/lib/opening-hours';
import { ScoreBadge } from '@/features/ratings/components/score-badge';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { formatRupees } from '@/shared/lib/money';
import { ChipButton } from '@/shared/ui/chip';
import type { PlacedDish } from '../queries/dishes';
import { priceCaps, type CityDishFilters } from '../schemas/city-dish-filters';
import { DietMark } from './diet-mark';

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
  const minute = useSyncExternalStore(subscribeMinute, readMinute, () => null);
  const now = minute === null ? null : new Date(minute * 60_000);

  const update = (next: Partial<CityDishFilters>) => {
    const merged = { ...filters, ...next };
    setFilters(merged);
    syncUrl(path, merged);
  };

  const statusFor = (branchId: string) => (now ? getOpenStatus(hours[branchId] ?? [], now, timezone) : null);

  const visible = dishes.filter((dish) => {
    if (filters.area && dish.localitySlug !== filters.area) return false;
    if (filters.maxPrice && (dish.pricePaise === null || dish.pricePaise > filters.maxPrice * 100))
      return false;
    if (filters.open && now && getOpenStatus(hours[dish.branchId] ?? [], now, timezone).state !== 'open')
      return false;
    return true;
  });

  const presentAreas = areas.filter((area) => dishes.some((dish) => dish.localitySlug === area.slug));
  const filtered = Boolean(filters.area || filters.maxPrice || filters.open);

  return (
    <div className="flex flex-col gap-6">
      <div
        role="group"
        aria-label={t('dish.filters')}
        className="flex flex-col gap-3 border-y-2 border-ink py-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 font-mono text-2xs tracking-widest text-ink-soft uppercase">
            {t('dish.filterArea')}
          </span>
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
          <span className="w-16 font-mono text-2xs tracking-widest text-ink-soft uppercase">
            {t('dish.filterPrice')}
          </span>
          <ChipButton selected={!filters.maxPrice} onClick={() => update({ maxPrice: undefined })}>
            {t('dish.filterAnyPrice')}
          </ChipButton>
          {priceCaps.map((cap) => (
            <ChipButton
              key={cap}
              selected={filters.maxPrice === cap}
              onClick={() => update({ maxPrice: cap })}
            >
              ≤ {formatRupees(cap * 100)}
            </ChipButton>
          ))}
          <span
            aria-hidden="true"
            className="mx-1 hidden h-6 border-l-2 border-dashed border-rule-strong sm:block"
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
              className="ml-1 font-mono text-xs uppercase underline decoration-2 underline-offset-4"
            >
              {t('dish.clearFilters')}
            </button>
          ) : null}
        </div>
      </div>

      <p className="font-mono text-xs tracking-widest uppercase" aria-live="polite">
        {visible.length === 1 ? t('dish.resultsCountOne') : t('dish.resultsCount', { count: visible.length })}
      </p>

      {visible.length === 0 ? (
        <p className="border-2 border-dashed border-rule-strong p-6 text-ink-soft">
          {dishes.length === 0 ? t('dish.cityEmpty') : t('dish.noMatches')}
        </p>
      ) : (
        <LayoutGroup>
          <ol className="flex flex-col gap-4">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((dish, index) => {
                const rank = index + 1;
                const top = rank === 1;
                const status = statusFor(dish.branchId);
                const rated = dish.weightSum >= minWeightForDisplay;
                return (
                  <m.li
                    key={dish.id}
                    layout
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.14 } }}
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  >
                    <article
                      className={cn(
                        'group relative flex press items-stretch border-2 border-ink bg-raised shadow-lift hover:-translate-y-0.5',
                        top && 'bg-haldi/25',
                      )}
                    >
                      <span
                        className={cn(
                          'flex w-14 shrink-0 flex-col items-center justify-center border-r-2 border-ink sm:w-20',
                          top ? 'bg-haldi text-on-haldi' : 'bg-ink text-on-ink',
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className="font-mono text-2xs tracking-widest uppercase opacity-80"
                        >
                          No.
                        </span>
                        <m.span
                          key={rank}
                          layout="position"
                          aria-hidden="true"
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="font-display text-4xl leading-none font-extrabold [font-stretch:70%] tabular-nums sm:text-5xl"
                        >
                          {String(rank).padStart(2, '0')}
                        </m.span>
                        <span className="sr-only">{t('dish.rankLabel', { rank })}</span>
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <h3 className="text-xl font-bold sm:text-2xl">
                            <Link
                              href={`/r/${dish.branchSlug}/dish/${dish.slug}`}
                              className="after:absolute after:inset-0 after:content-['']"
                            >
                              {dish.branchName}
                            </Link>
                          </h3>
                          <p className="text-sm text-ink-soft">{dish.name}</p>
                          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs">
                            <span className="inline-flex items-center gap-1 uppercase">
                              <MapPin aria-hidden="true" className="size-3.5" />
                              {dish.localityName}
                            </span>
                            {dish.pricePaise !== null ? (
                              <span className="font-semibold tabular-nums">
                                {formatRupees(dish.pricePaise)}
                              </span>
                            ) : null}
                            <DietMark diet={dish.diet} />
                            {status?.state === 'open' ? (
                              <span className="inline-flex items-center gap-1.5 font-semibold text-live uppercase">
                                <span aria-hidden="true" className="size-2 rounded-full bg-live" />
                                {t('place.open')} · {t('place.closesAt', { time: status.closesAt })}
                              </span>
                            ) : status?.state === 'closed' ? (
                              <span className="inline-flex items-center gap-1.5 text-ink-soft uppercase">
                                <MoonStar aria-hidden="true" className="size-3.5" />
                                {t('place.closed')} · {t('place.opensAt', { time: status.opensAt })}
                              </span>
                            ) : null}
                          </p>
                        </div>
                        <ScoreBadge
                          lovedPct={rated ? dish.lovedPct : null}
                          ratingCount={dish.ratingCount}
                          size={top ? 'md' : 'sm'}
                          className="shrink-0"
                        />
                      </div>
                    </article>
                  </m.li>
                );
              })}
            </AnimatePresence>
          </ol>
        </LayoutGroup>
      )}
    </div>
  );
}
