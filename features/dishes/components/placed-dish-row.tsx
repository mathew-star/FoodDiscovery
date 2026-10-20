import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { OpenStatus } from '@/features/places/components/open-status';
import type { HoursRow } from '@/features/places/lib/opening-hours';
import { ScoreBadge } from '@/features/ratings/components/score-badge';
import { t } from '@/i18n';
import { formatRupees } from '@/shared/lib/money';
import type { PlacedDish } from '../queries/dishes';
import { DietMark } from './diet-mark';
import { DishPlate } from './dish-plate';

type PlacedDishRowProps = {
  dish: PlacedDish;
  rank?: number;
  minWeightForDisplay: number;
  hours?: HoursRow[];
  timezone?: string;
};

export function PlacedDishRow({ dish, rank, minWeightForDisplay, hours, timezone }: PlacedDishRowProps) {
  const rated = dish.weightSum >= minWeightForDisplay;
  return (
    <article className="relative flex items-start gap-3 rounded-md border border-border bg-surface p-3 shadow-1 transition-colors duration-(--dur-fast) hover:border-border-strong">
      {rank !== undefined ? (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold tabular-nums">
          <span aria-hidden="true">{rank}</span>
          <span className="sr-only">{t('dish.rankLabel', { rank })}</span>
        </span>
      ) : null}
      <DishPlate name={dish.name} className="size-14" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-sans text-base font-semibold">
            <Link
              href={`/r/${dish.branchSlug}/dish/${dish.slug}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {dish.name}
            </Link>
            <span className="block text-sm font-normal text-muted">
              {t('dish.atBranch', { branch: dish.branchName })}
            </span>
          </h3>
          <div className="flex shrink-0 items-center gap-2">
            {dish.pricePaise !== null ? (
              <span className="font-semibold tabular-nums">{formatRupees(dish.pricePaise)}</span>
            ) : null}
            <DietMark diet={dish.diet} />
          </div>
        </div>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin aria-hidden="true" className="size-3.5" />
            {dish.localityName}
          </span>
          {hours && timezone ? <OpenStatus hours={hours} timezone={timezone} /> : null}
        </p>
        <ScoreBadge lovedPct={rated ? dish.lovedPct : null} ratingCount={dish.ratingCount} />
      </div>
    </article>
  );
}
