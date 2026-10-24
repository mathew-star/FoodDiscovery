import Link from 'next/link';
import type { ReactNode } from 'react';
import { ScoreBadge } from '@/features/ratings/components/score-badge';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { formatRupees } from '@/shared/lib/money';
import type { PlacedDish } from '../queries/dishes';
import { DietMark } from './diet-mark';

type PlacedDishRowProps = {
  dish: PlacedDish;
  rank?: number;
  minWeightForDisplay: number;
  /** Show the dish name as the title (lists across places) or the branch name (one dish's ranking). */
  showDishName?: boolean;
  /** Open/closed badge; rendered by the caller so this row stays usable in client lists. */
  status?: ReactNode;
};

/** Leaderboard row (DESIGN-SYSTEM §7.9). Lists of rows sit in `<LeaderboardList>`. */
export function PlacedDishRow({
  dish,
  rank,
  minWeightForDisplay,
  showDishName = true,
  status,
}: PlacedDishRowProps) {
  const rated = dish.weightSum >= minWeightForDisplay;
  const title = showDishName ? dish.name : dish.branchName;
  return (
    <article data-diet={dish.diet} className="relative flex items-center gap-3.5 px-1 py-3">
      {rank !== undefined ? (
        <span className="w-8 shrink-0 font-display text-2xl leading-none font-extrabold tabular-nums">
          <span aria-hidden="true">{rank}</span>
          <span className="sr-only">{t('dish.rankLabel', { rank })}</span>
        </span>
      ) : null}
      <div className="flex min-w-0 grow flex-col gap-0.5">
        <h3 className="text-base leading-snug">
          <Link
            href={`/r/${dish.branchSlug}/dish/${dish.slug}`}
            className="after:absolute after:inset-0 hover:underline hover:underline-offset-4"
          >
            {title}
          </Link>
        </h3>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-inkMuted">
          <DietMark diet={dish.diet} />
          {showDishName ? <span>{t('dish.atBranch', { branch: dish.branchName })} ·</span> : null}
          <span>{dish.localityName}</span>
          {dish.pricePaise !== null ? (
            <span className="tabular-nums">· {formatRupees(dish.pricePaise)}</span>
          ) : null}
          {status}
        </p>
      </div>
      <ScoreBadge
        variant="pill"
        lovedPct={rated ? dish.lovedPct : null}
        ratingCount={dish.ratingCount}
        className="shrink-0"
      />
    </article>
  );
}

/** Ranked rows separated by dashed rules between two ink lines. */
export function LeaderboardList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ol className={cn('divide-y-2 divide-dashed divide-ink/15 border-y-2 border-ink', className)}>
      {children}
    </ol>
  );
}
