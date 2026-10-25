import Link from 'next/link';
import { FoodScore } from '@/features/ratings/components/food-score';
import { t } from '@/i18n';
import { Badge } from '@/shared/ui/badge';
import type { BranchDetail } from '../queries/branches';
import { ActionRow } from './action-row';
import { OpenStatus } from './open-status';
import { PriceBand } from './price-band';

/** Everything needed to decide sits above the fold at 390 × 844 (spec E2-1). */
export function BranchHeader({ branch }: { branch: BranchDetail }) {
  return (
    <header className="flex flex-col gap-4">
      <p className="flex flex-wrap items-center gap-2 text-xs text-inkMuted">
        <Link
          href={`/${branch.citySlug}/area/${branch.localitySlug}`}
          className="text-ink underline underline-offset-4 hover:text-terracottaDeep"
        >
          {branch.localityName}
        </Link>
        <span aria-hidden="true">·</span>
        <span>{branch.cityName}</span>
        {branch.vegOnly ? <Badge>{t('place.vegOnly')}</Badge> : null}
        {branch.status === 'temporarily_closed' ? (
          <Badge tone="disclosure">{t('place.temporarilyClosed')}</Badge>
        ) : null}
      </p>
      <h1 className="type-display-l">{branch.name}</h1>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
        <OpenStatus hours={branch.hours} timezone={branch.timezone} />
        <PriceBand band={branch.priceBand} />
        <ul aria-label={t('place.cuisines')} className="flex flex-wrap gap-x-2 gap-y-1 text-inkMuted">
          {branch.cuisines.map((cuisine, index) => (
            <li key={cuisine.id}>
              {index > 0 ? <span aria-hidden="true">· </span> : null}
              <Link
                href={`/${branch.citySlug}/cuisine/${cuisine.slug}`}
                className="underline-offset-4 hover:text-ink hover:underline"
              >
                {cuisine.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <FoodScore score={branch.foodScore} />
      <ActionRow
        branchId={branch.id}
        name={branch.name}
        locality={branch.localityName}
        path={`/r/${branch.slug}`}
        location={branch.location}
        phone={branch.phone}
      />
    </header>
  );
}
