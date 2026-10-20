import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { CSSProperties } from 'react';
import { OpenStatus } from '@/features/places/components/open-status';
import type { HoursRow } from '@/features/places/lib/opening-hours';
import { ScoreBadge } from '@/features/ratings/components/score-badge';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { formatRupees } from '@/shared/lib/money';
import type { PlacedDish } from '../queries/dishes';
import { DietMark } from './diet-mark';
import { DishTile } from './dish-tile';

type PlacedDishRowProps = {
  dish: PlacedDish;
  rank?: number;
  minWeightForDisplay: number;
  hours?: HoursRow[];
  timezone?: string;
  showDishName?: boolean;
};

export function PlacedDishRow({
  dish,
  rank,
  minWeightForDisplay,
  hours,
  timezone,
  showDishName = true,
}: PlacedDishRowProps) {
  const rated = dish.weightSum >= minWeightForDisplay;
  const top = rank === 1;
  return (
    <article
      style={{ '--i': rank ?? 0 } as CSSProperties}
      className={cn(
        'group relative flex press rise-in items-stretch border-2 border-ink bg-raised shadow-lift hover:-translate-y-0.5',
        top && 'bg-haldi/25',
      )}
    >
      {rank !== undefined ? (
        <span
          className={cn(
            'flex w-14 shrink-0 flex-col items-center justify-center border-r-2 border-ink sm:w-20',
            top ? 'bg-haldi text-on-haldi' : 'bg-ink text-on-ink',
          )}
        >
          <span className="font-mono text-2xs tracking-widest uppercase opacity-80" aria-hidden="true">
            No.
          </span>
          <span
            aria-hidden="true"
            className="font-display text-4xl leading-none font-extrabold [font-stretch:70%] tabular-nums sm:text-5xl"
          >
            {String(rank).padStart(2, '0')}
          </span>
          <span className="sr-only">{t('dish.rankLabel', { rank })}</span>
        </span>
      ) : (
        <span className="flex items-center pl-3">
          <DishTile name={dish.name} size="sm" />
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="text-xl font-bold sm:text-2xl">
            <Link
              href={`/r/${dish.branchSlug}/dish/${dish.slug}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {showDishName ? dish.name : dish.branchName}
            </Link>
          </h3>
          {showDishName ? (
            <p className="text-sm text-ink-soft">{t('dish.atBranch', { branch: dish.branchName })}</p>
          ) : null}
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs">
            <span className="inline-flex items-center gap-1 uppercase">
              <MapPin aria-hidden="true" className="size-3.5" />
              {dish.localityName}
            </span>
            {dish.pricePaise !== null ? (
              <span className="font-semibold tabular-nums">{formatRupees(dish.pricePaise)}</span>
            ) : null}
            <DietMark diet={dish.diet} />
            {hours && timezone ? <OpenStatus hours={hours} timezone={timezone} compact /> : null}
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
  );
}
