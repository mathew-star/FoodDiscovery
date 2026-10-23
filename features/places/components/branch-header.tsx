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
    <header className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <p className="flex flex-wrap items-center gap-2 font-mono text-xs tracking-wide uppercase">
          <Link
            href={`/${branch.citySlug}/area/${branch.localitySlug}`}
            className="inline-flex items-center gap-1 underline decoration-rule-strong decoration-2 underline-offset-4 hover:decoration-ink"
          >
            <MapPin aria-hidden="true" className="size-3.5" />
            {branch.localityName}
          </Link>
          <span aria-hidden="true">/</span>
          <span>{branch.cityName}</span>
          {branch.vegOnly ? <Badge tone="live">{t('place.vegOnly')}</Badge> : null}
          {branch.status === 'temporarily_closed' ? (
            <Badge tone="danger">{t('place.temporarilyClosed')}</Badge>
          ) : null}
        </p>
        <h1 className="rise-in text-6xl font-extrabold md:text-7xl">{branch.name}</h1>
      </div>

      <div className="grid items-stretch border-y-2 border-ink sm:grid-cols-[auto_1fr]">
        <div className="flex items-center border-b-2 border-dashed border-rule-strong py-2 sm:border-r-2 sm:border-b-0 sm:border-solid sm:border-ink sm:pr-4">
          <OpenStatus hours={branch.hours} timezone={branch.timezone} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 sm:pl-4">
          <PriceBand band={branch.priceBand} />
          <ul
            aria-label={t('place.cuisines')}
            className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs uppercase"
          >
            {branch.cuisines.map((cuisine) => (
              <li key={cuisine.id}>
                <Link
                  href={`/${branch.citySlug}/cuisine/${cuisine.slug}`}
                  className="underline decoration-rule-strong decoration-2 underline-offset-4 hover:decoration-ink"
                >
                  {cuisine.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <FoodScore score={branch.foodScore} animate />
      <ActionRow
        name={branch.name}
        path={`/r/${branch.slug}`}
        location={branch.location}
        phone={branch.phone}
      />
    </header>
  );
}
