import Link from 'next/link';
import { ScoreBadge } from '@/features/ratings/components/score-badge';
import { t } from '@/i18n';
import { formatRupees } from '@/shared/lib/money';
import { Badge } from '@/shared/ui/badge';
import type { BranchMenuDish } from '../queries/dishes';
import { DietMark } from './diet-mark';

type DishRowProps = {
  dish: BranchMenuDish;
  branchSlug: string;
  minWeightForDisplay: number;
  knownFor?: boolean;
  rank?: number;
  /** `xray`: ranked "What to order here" row (DESIGN-SYSTEM §7.9). `menu`: full dish list row. */
  variant?: 'xray' | 'menu';
};

function lastSeen(dish: BranchMenuDish): string | null {
  if (dish.lastRatedDays === null) return null;
  return dish.lastRatedDays === 0
    ? t('rating.lastRatedToday')
    : t('rating.lastRated', { days: dish.lastRatedDays });
}

export function DishRow({
  dish,
  branchSlug,
  minWeightForDisplay,
  knownFor = false,
  rank,
  variant = 'menu',
}: DishRowProps) {
  const rated = dish.weightSum >= minWeightForDisplay;
  const href = `/r/${branchSlug}/dish/${dish.slug}`;
  const seen = rated ? lastSeen(dish) : null;
  const price = dish.pricePaise !== null ? formatRupees(dish.pricePaise) : null;
  const name = (
    <Link href={href} className="after:absolute after:inset-0 hover:underline hover:underline-offset-4">
      {dish.name}
    </Link>
  );

  if (variant === 'menu') {
    return (
      <article data-diet={dish.diet} className="relative py-3">
        <div className="flex items-baseline gap-2">
          <DietMark diet={dish.diet} className="translate-y-0.5" />
          <h4 className="grow text-base leading-snug">{name}</h4>
          {price ? <span className="text-sm tabular-nums">{price}</span> : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 pl-6">
          <ScoreBadge
            variant="inline"
            lovedPct={rated ? dish.lovedPct : null}
            ratingCount={dish.ratingCount}
          />
          {dish.isJain ? <Badge>{t('dish.jain')}</Badge> : null}
          {seen ? <span className="text-[11px] text-inkMuted">{seen}</span> : null}
        </div>
      </article>
    );
  }

  const pct = rated && dish.lovedPct !== null ? Math.round(dish.lovedPct) : null;
  return (
    <article
      data-diet={dish.diet}
      className="relative flex items-center gap-3 rounded-row border-[1.5px] border-ink bg-cream px-3 py-2.5 text-sm transition-colors duration-(--dur-instant) hover:bg-creamDark"
    >
      {rank !== undefined ? (
        <span className="w-4 shrink-0 text-center tabular-nums">
          <span aria-hidden="true">{rank}</span>
          <span className="sr-only">{t('dish.rankLabel', { rank })}</span>
        </span>
      ) : null}
      <div className="flex min-w-0 grow flex-col gap-0.5">
        <h3 className="flex flex-wrap items-center gap-2 text-sm leading-snug">
          {name}
          {knownFor && !rated ? <Badge tone="lime">{t('rating.knownFor')}</Badge> : null}
          {dish.isJain ? <Badge>{t('dish.jain')}</Badge> : null}
        </h3>
        <p className="flex flex-wrap items-center gap-x-2 text-[11px] text-inkMuted">
          <DietMark diet={dish.diet} />
          <span>
            {dish.ratingCount === 1
              ? t('rating.ratingsCountOne')
              : t('rating.ratingsCount', { count: dish.ratingCount.toLocaleString('en-IN') })}
          </span>
          {seen ? <span>· {seen}</span> : null}
        </p>
      </div>
      {pct !== null ? (
        <>
          <span
            aria-hidden="true"
            className="h-2 w-20 shrink-0 overflow-hidden rounded-full border border-ink bg-paper max-[520px]:hidden"
          >
            <span style={{ width: `${pct}%` }} className="block h-full bg-olive" />
          </span>
          <span className="w-12 shrink-0 text-right text-xs font-bold tabular-nums">
            {pct}%<span className="sr-only"> {t('rating.lovedWord')}</span>
          </span>
        </>
      ) : (
        <ScoreBadge lovedPct={null} ratingCount={dish.ratingCount} />
      )}
      {price ? (
        <span className="w-12 shrink-0 text-right text-[11px] text-inkMuted tabular-nums">{price}</span>
      ) : null}
    </article>
  );
}
