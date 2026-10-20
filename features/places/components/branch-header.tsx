import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { FoodScore } from '@/features/ratings/components/food-score';
import { t } from '@/i18n';
import { Badge } from '@/shared/ui/badge';
import type { BranchDetail } from '../queries/branches';
import { ActionRow } from './action-row';
import { OpenStatus } from './open-status';
import { PriceBand } from './price-band';

export function BranchHeader({ branch }: { branch: BranchDetail }) {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold md:text-4xl">{branch.name}</h1>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
          <Link
            href={`/${branch.citySlug}/area/${branch.localitySlug}`}
            className="inline-flex items-center gap-1 underline-offset-4 hover:text-text hover:underline"
          >
            <MapPin aria-hidden="true" className="size-4" />
            {branch.localityName}
          </Link>
          <PriceBand band={branch.priceBand} />
          {branch.vegOnly ? <Badge tone="accent">{t('place.vegOnly')}</Badge> : null}
          {branch.status === 'temporarily_closed' ? (
            <Badge tone="danger">{t('place.temporarilyClosed')}</Badge>
          ) : null}
        </p>
      </div>
      <OpenStatus hours={branch.hours} timezone={branch.timezone} />
      <ul aria-label={t('place.cuisines')} className="flex flex-wrap gap-2">
        {branch.cuisines.map((cuisine) => (
          <li key={cuisine.id}>
            <Link
              href={`/${branch.citySlug}/cuisine/${cuisine.slug}`}
              className="inline-flex h-8 items-center rounded-full bg-surface-2 px-3 text-sm font-medium hover:bg-border"
            >
              {cuisine.name}
            </Link>
          </li>
        ))}
      </ul>
      <FoodScore score={branch.foodScore} />
      <ActionRow
        name={branch.name}
        path={`/r/${branch.slug}`}
        location={branch.location}
        phone={branch.phone}
      />
    </header>
  );
}
