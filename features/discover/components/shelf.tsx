import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DietMark } from '@/features/dishes/components/diet-mark';
import { DishTile } from '@/features/dishes/components/dish-tile';
import type { CategoryShelf } from '@/features/dishes/queries/dishes';
import { ScoreBadge } from '@/features/ratings/components/score-badge';
import type { CitySlug } from '@/features/geo/schemas/city';
import { t } from '@/i18n';
import { formatRupees } from '@/shared/lib/money';

export function Shelf({
  shelf,
  city,
  minWeightForDisplay,
}: {
  shelf: CategoryShelf;
  city: CitySlug;
  minWeightForDisplay: number;
}) {
  const id = `shelf-${shelf.slug}`;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4 border-b-2 border-ink pb-2">
        <h2 id={id} className="text-5xl font-extrabold md:text-6xl">
          {shelf.name}
        </h2>
        <p className="font-mono text-xs text-ink-soft uppercase">
          {t('discover.shelfCount', { count: shelf.dishes.length })}
        </p>
      </div>
      <ul className="-mx-4 flex snap-x snap-mandatory [scrollbar-width:thin] gap-4 overflow-x-auto px-4 pt-2 pb-4 md:mx-0 md:px-0">
        {shelf.dishes.map((dish) => (
          <li key={dish.id} className="w-[17.5rem] shrink-0 snap-start">
            <article className="group relative flex h-full flex-col drop-shadow-[3px_3px_0_var(--lift-color)]">
              <div className="flex flex-1 flex-col gap-3 border-x-2 border-t-2 border-ink bg-raised p-4 pb-6 perforate-b">
                <div className="flex items-start justify-between gap-3">
                  <DishTile name={dish.canonicalName} size="md" />
                  <DietMark diet={dish.diet} />
                </div>
                <h3 className="text-3xl font-bold">
                  <Link
                    href={`/r/${dish.branchSlug}/dish/${dish.slug}`}
                    className="group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4 after:absolute after:inset-0 after:content-['']"
                  >
                    {dish.canonicalName}
                  </Link>
                </h3>
                <p className="text-sm text-ink-soft">{t('discover.bestAt', { branch: dish.branchName })}</p>
                <p className="flex items-baseline gap-2 font-mono text-xs uppercase">
                  <span>{dish.localityName}</span>
                  <span aria-hidden="true" className="leader" />
                  {dish.pricePaise !== null ? (
                    <span className="font-semibold">{formatRupees(dish.pricePaise)}</span>
                  ) : null}
                </p>
                <ScoreBadge
                  lovedPct={dish.weightSum >= minWeightForDisplay ? dish.lovedPct : null}
                  ratingCount={dish.ratingCount}
                  className="mt-auto"
                />
              </div>
              <Link
                href={`/${city}/dish/${dish.canonicalSlug}`}
                className="relative z-10 flex items-center justify-between gap-2 border-2 border-t-0 border-dashed border-ink bg-sunk px-4 py-2.5 font-mono text-2xs font-bold tracking-wide uppercase hover:bg-haldi hover:text-on-haldi"
              >
                {t('discover.cityRankingLink', { dish: dish.canonicalName })}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
