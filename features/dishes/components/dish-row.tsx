import Link from 'next/link';
import { ScoreBadge } from '@/features/ratings/components/score-badge';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { formatRupees } from '@/shared/lib/money';
import { Badge } from '@/shared/ui/badge';
import type { BranchMenuDish } from '../queries/dishes';
import { DietMark } from './diet-mark';
import { DishPlate } from './dish-plate';

type DishRowProps = {
  dish: BranchMenuDish;
  branchSlug: string;
  minWeightForDisplay: number;
  knownFor?: boolean;
  variant?: 'feature' | 'compact';
};

export function DishRow({
  dish,
  branchSlug,
  minWeightForDisplay,
  knownFor = false,
  variant = 'compact',
}: DishRowProps) {
  const rated = dish.weightSum >= minWeightForDisplay;
  return (
    <article
      className={cn(
        'relative flex gap-3 rounded-md transition-colors duration-(--dur-fast)',
        variant === 'feature'
          ? 'border border-border bg-surface p-3 shadow-1 hover:border-border-strong'
          : 'py-3',
      )}
    >
      {variant === 'feature' ? <DishPlate name={dish.name} className="size-16" /> : null}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-sans text-base font-semibold">
            <Link
              href={`/r/${branchSlug}/dish/${dish.slug}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {dish.name}
            </Link>
          </h3>
          <div className="flex shrink-0 items-center gap-2">
            {dish.pricePaise !== null ? (
              <span className="font-semibold tabular-nums">{formatRupees(dish.pricePaise)}</span>
            ) : null}
            <DietMark diet={dish.diet} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {knownFor ? <Badge tone="primary">{t('rating.knownFor')}</Badge> : null}
          {knownFor && !rated ? null : (
            <ScoreBadge lovedPct={rated ? dish.lovedPct : null} ratingCount={dish.ratingCount} />
          )}
          {dish.isJain ? <Badge>{t('dish.jain')}</Badge> : null}
          {dish.lastRatedDays !== null && rated ? (
            <span className="text-xs text-muted">
              {dish.lastRatedDays === 0
                ? t('rating.lastRatedToday')
                : t('rating.lastRated', { days: dish.lastRatedDays })}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
