'use client';

import { useState } from 'react';
import { useVegOnly } from '@/features/dishes/hooks/use-veg-only';
import { t, type MessageKey } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { formatRupees } from '@/shared/lib/money';
import { ChipButton } from '@/shared/ui/chip';
import {
  haleemBoard,
  leaderboardFilters,
  type LeaderboardEntry,
  type LeaderboardFilter,
} from '../lib/content';

const filterLabel: Record<LeaderboardFilter, MessageKey> = {
  open: 'chips.openNow',
  cheap: 'chips.under300',
  near: 'chips.within3km',
};

function Trend({ change }: { change: number }) {
  if (change === 0) {
    return (
      <span className="w-7 text-right text-[11px] text-inkMuted">
        <span aria-hidden="true">–</span>
        <span className="sr-only">{t('landing.modes.board.trendSame')}</span>
      </span>
    );
  }
  const up = change > 0;
  return (
    <span
      className={cn('w-7 text-right text-[11px] font-bold', up ? 'text-oliveDeep' : 'text-terracottaDeep')}
    >
      <span aria-hidden="true">
        {up ? '▲' : '▼'}
        {Math.abs(change)}
      </span>
      <span className="sr-only">
        {t(up ? 'landing.modes.board.trendUp' : 'landing.modes.board.trendDown', { n: Math.abs(change) })}
      </span>
    </span>
  );
}

function meta(entry: LeaderboardEntry): string {
  const status = entry.opensAt
    ? t('place.opensAt', { time: entry.opensAt })
    : t('landing.modes.board.openNow');
  return [formatRupees(entry.pricePaise), t('place.km', { km: entry.distanceKm.toFixed(1) }), status].join(
    ' · ',
  );
}

/** City dish leaderboard preview (DESIGN-SYSTEM §7.9 leaderboard rows). */
export function LeaderboardPanel() {
  const vegOnly = useVegOnly();
  const [active, setActive] = useState<ReadonlySet<LeaderboardFilter>>(new Set());
  const rows = haleemBoard.entries.filter((entry) => [...active].every((filter) => entry.matches[filter]));

  function toggle(filter: LeaderboardFilter) {
    setActive((current) => {
      const next = new Set(current);
      if (!next.delete(filter)) next.add(filter);
      return next;
    });
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h3 className="type-title-l">{t('landing.modes.board.title')}</h3>
        <span className="text-[11px] text-inkMuted">{t('landing.modes.board.updated')}</span>
      </div>
      <div
        role="group"
        aria-label={t('landing.modes.board.filtersLabel')}
        className="mb-4 flex flex-wrap gap-2"
      >
        {leaderboardFilters.map((filter) => (
          <ChipButton key={filter} selected={active.has(filter)} onClick={() => toggle(filter)}>
            {t(filterLabel[filter])}
          </ChipButton>
        ))}
      </div>
      <ol aria-live="polite" className="divide-y-2 divide-dashed divide-ink/15 border-y-2 border-ink">
        {rows.map((entry, index) => (
          <li key={entry.place.slug} data-diet="nonveg" className="flex items-center gap-3.5 px-1 py-3">
            <span className="w-7 shrink-0 font-display text-2xl font-extrabold">{index + 1}</span>
            <div className="grow">
              <p>{t('place.inArea', { place: entry.place.name, area: entry.place.area })}</p>
              <p className="text-[11px] text-inkMuted">{meta(entry)}</p>
            </div>
            <span className="rounded-lg border-[1.5px] border-ink bg-lime px-2 py-0.5 text-[13px] font-bold">
              {entry.lovedPct}%<span className="sr-only"> {t('rating.lovedWord')}</span>
            </span>
            <Trend change={entry.trend} />
          </li>
        ))}
      </ol>
      {rows.length === 0 && !vegOnly ? (
        <p className="py-6 text-center text-sm text-inkMuted">{t('dish.noMatches')}</p>
      ) : null}
      <p className="veg-only-hint py-6 text-center text-sm text-inkMuted">{t('landing.modes.board.veg')}</p>
    </>
  );
}
