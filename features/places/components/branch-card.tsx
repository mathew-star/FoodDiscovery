import Link from 'next/link';
import { FoodScore } from '@/features/ratings/components/food-score';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/badge';
import { cardVariants } from '@/shared/ui/card';
import type { BranchCard as BranchCardData } from '../queries/branches';
import { OpenStatus } from './open-status';
import { PriceBand } from './price-band';

type BranchCardProps = {
  branch: BranchCardData & { distanceMeters?: number };
  timezone: string;
  showLocality?: boolean;
};

function formatDistance(meters: number): string {
  return meters < 1_000
    ? t('place.distanceM', { m: Math.round(meters / 10) * 10 })
    : t('place.distanceKm', { km: (meters / 1_000).toFixed(1) });
}

export function BranchCard({ branch, timezone, showLocality = true }: BranchCardProps) {
  return (
    <article className={cn(cardVariants({ size: 'md' }), 'group relative flex h-full flex-col gap-3 p-4')}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="type-title-s">
          <Link
            href={`/r/${branch.slug}`}
            className="group-hover:underline group-hover:underline-offset-4 after:absolute after:inset-0"
          >
            {branch.name}
          </Link>
        </h3>
        <PriceBand band={branch.priceBand} />
      </div>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-inkMuted">
        {showLocality ? <span>{branch.localityName}</span> : null}
        {branch.distanceMeters !== undefined ? <span>· {formatDistance(branch.distanceMeters)}</span> : null}
        {branch.vegOnly ? <Badge>{t('place.vegOnly')}</Badge> : null}
      </p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t-2 border-dashed border-ink/25 pt-3">
        <OpenStatus hours={branch.hours} timezone={timezone} />
        <span className="relative z-10">
          <FoodScore score={branch.foodScore} />
        </span>
      </div>
    </article>
  );
}
