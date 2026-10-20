import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { FoodScore } from '@/features/ratings/components/food-score';
import { t } from '@/i18n';
import { Badge } from '@/shared/ui/badge';
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
    <article className="relative flex h-full flex-col gap-2 rounded-md border border-border bg-surface p-4 shadow-1 transition-colors duration-(--dur-fast) hover:border-border-strong">
      <h3 className="font-sans text-base font-semibold">
        <Link href={`/r/${branch.slug}`} className="after:absolute after:inset-0 after:content-['']">
          {branch.name}
        </Link>
      </h3>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
        {showLocality ? (
          <span className="inline-flex items-center gap-1">
            <MapPin aria-hidden="true" className="size-3.5" />
            {branch.localityName}
          </span>
        ) : null}
        {branch.distanceMeters !== undefined ? <span>{formatDistance(branch.distanceMeters)}</span> : null}
        <PriceBand band={branch.priceBand} />
        {branch.vegOnly ? <Badge tone="accent">{t('place.vegOnly')}</Badge> : null}
      </p>
      <OpenStatus hours={branch.hours} timezone={timezone} />
      <div className="relative z-10 mt-auto">
        <FoodScore score={branch.foodScore} />
      </div>
    </article>
  );
}
