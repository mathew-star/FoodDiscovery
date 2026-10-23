import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ScoreBadge } from '@/features/ratings/components/score-badge';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { formatRupees } from '@/shared/lib/money';
import { Badge } from '@/shared/ui/badge';
import { Stamp } from '@/shared/ui/stamp';
import type { BranchMenuDish } from '../queries/dishes';
import { DietMark } from './diet-mark';
import { DishTile } from './dish-tile';

type DishRowProps = {
  dish: BranchMenuDish;
  branchSlug: string;
  minWeightForDisplay: number;
  knownFor?: boolean;
  rank?: number;
  variant?: 'feature' | 'compact';
};

function seen(dish: BranchMenuDish): string | null {
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
  variant = 'compact',
}: DishRowProps) {
  const rated = dish.weightSum >= minWeightForDisplay;
  const href = `/r/${branchSlug}/dish/${dish.slug}`;
  const lastSeen = rated ? seen(dish) : null;

  if (variant === 'compact') {
    return (
      <article className="group relative py-3">
        <div className="flex items-baseline gap-2">
          <DietMark diet={dish.diet} className="translate-y-0.5" />
          <h4 className="font-sans text-lg leading-tight font-semibold">
            <Link
              href={href}
              className="group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4 after:absolute after:inset-0 after:content-['']"
            >
              {dish.name}
            </Link>
          </h4>
          <span aria-hidden="true" className="leader" />
          {dish.pricePaise !== null ? (
            <span className="font-mono text-sm font-semibold tabular-nums">
              {formatRupees(dish.pricePaise)}
            </span>
          ) : null}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 pl-6">
          <ScoreBadge lovedPct={rated ? dish.lovedPct : null} ratingCount={dish.ratingCount} />
          {dish.isJain ? <Badge>{t('dish.jain')}</Badge> : null}
          {lastSeen ? <span className="font-mono text-2xs text-ink-soft uppercase">{lastSeen}</span> : null}
        </div>
      </article>
    );
  }

  return (
    <article
      style={{ '--i': rank ?? 0 } as CSSProperties}
      className="group relative flex h-full press rise-in gap-3 border-2 border-ink bg-raised p-3 shadow-lift hover:-translate-y-0.5"
    >
      <DishTile name={dish.name} size="md" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-2xl font-bold">
            <Link href={href} className="after:absolute after:inset-0 after:content-['']">
              {dish.name}
            </Link>
          </h3>
          {rank !== undefined ? (
            <span
              className="font-display text-3xl leading-none font-extrabold text-ink-soft/50 [font-stretch:70%] tabular-nums"
              aria-hidden="true"
            >
              {String(rank).padStart(2, '0')}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2 font-mono text-sm">
          {dish.pricePaise !== null ? (
            <span className="font-semibold tabular-nums">{formatRupees(dish.pricePaise)}</span>
          ) : null}
          <DietMark diet={dish.diet} />
          {dish.isJain ? <Badge>{t('dish.jain')}</Badge> : null}
        </div>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-2">
          {knownFor && !rated ? null : (
            <ScoreBadge lovedPct={rated ? dish.lovedPct : null} ratingCount={dish.ratingCount} />
          )}
          {lastSeen ? <span className="font-mono text-2xs text-ink-soft uppercase">{lastSeen}</span> : null}
        </div>
      </div>
      {knownFor ? (
        <Stamp size="xs" tilt={7} animate index={rank} className="absolute -top-3 right-3 bg-raised text-ink">
          {t('rating.knownFor')}
        </Stamp>
      ) : rank === 1 && rated ? (
        <Stamp
          size="xs"
          tilt={6}
          animate
          index={rank}
          className={cn('absolute -top-3 right-3 bg-raised text-rate-loved')}
        >
          {t('rating.topPick')}
        </Stamp>
      ) : null}
    </article>
  );
}
