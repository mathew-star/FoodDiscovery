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
    <article className="group relative flex h-full flex-col bg-raised drop-shadow-[3px_3px_0_var(--lift-color)]">
      <div className="flex h-full flex-col gap-3 border-2 border-ink bg-raised p-4 notch-x [--notch-y:62%]">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-2xl font-bold">
            <Link
              href={`/r/${branch.slug}`}
              className="group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4 after:absolute after:inset-0 after:content-['']"
            >
              {branch.name}
            </Link>
          </h3>
          <PriceBand band={branch.priceBand} />
        </div>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase">
          {showLocality ? (
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden="true" className="size-3.5" />
              {branch.localityName}
            </span>
          ) : null}
          {branch.distanceMeters !== undefined ? <span>{formatDistance(branch.distanceMeters)}</span> : null}
          {branch.vegOnly ? <Badge tone="live">{t('place.vegOnly')}</Badge> : null}
        </p>
        <hr aria-hidden="true" className="border-0 border-t-2 border-dashed border-rule-strong" />
        <OpenStatus hours={branch.hours} timezone={timezone} compact />
        <div className="relative z-10 mt-auto">
          <FoodScore score={branch.foodScore} />
        </div>
      </div>
    </article>
  );
}
