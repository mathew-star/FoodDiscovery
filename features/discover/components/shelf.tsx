import Link from 'next/link';
import { DietMark } from '@/features/dishes/components/diet-mark';
import type { CategoryShelf } from '@/features/dishes/queries/dishes';
import type { CitySlug } from '@/features/geo/schemas/city';
import { ScoreBadge } from '@/features/ratings/components/score-badge';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { formatRupees } from '@/shared/lib/money';
import { cardVariants } from '@/shared/ui/card';
import { ImageSlot } from '@/shared/ui/image-slot';

type ShelfProps = { shelf: CategoryShelf; city: CitySlug; minWeightForDisplay: number };

/** "Top dishes by category" row on Discover (spec §3.5): the best branch dish per canonical dish. */
export function Shelf({ shelf, city, minWeightForDisplay }: ShelfProps) {
  const id = `shelf-${shelf.slug}`;
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <h2 id={id} className="type-title-l">
          {shelf.name}
        </h2>
        <p className="text-xs text-inkMuted">{t('discover.shelfCount', { count: shelf.dishes.length })}</p>
      </div>
      <ul className="-mx-5 no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pt-1 pb-3 md:mx-0 md:px-1">
        {shelf.dishes.map((dish) => (
          <li key={dish.id} data-diet={dish.diet} className="w-[17rem] shrink-0 snap-start">
            <article
              className={cn(
                cardVariants({ size: 'md' }),
                'group relative flex h-full flex-col overflow-hidden',
              )}
            >
              <ImageSlot
                label={t('imageSlot.dishPhoto', { width: 800, height: 600 })}
                className="h-32 border-b-2 border-ink"
              />
              <div className="flex grow flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="type-title-s">
                    <Link
                      href={`/r/${dish.branchSlug}/dish/${dish.slug}`}
                      className="group-hover:underline group-hover:underline-offset-4 after:absolute after:inset-0"
                    >
                      {dish.canonicalName}
                    </Link>
                  </h3>
                  <DietMark diet={dish.diet} />
                </div>
                <p className="text-xs text-inkMuted">
                  {t('discover.bestAt', { branch: dish.branchName })} · {dish.localityName}
                </p>
                <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                  <ScoreBadge
                    variant="pill"
                    lovedPct={dish.weightSum >= minWeightForDisplay ? dish.lovedPct : null}
                    ratingCount={dish.ratingCount}
                  />
                  {dish.pricePaise !== null ? (
                    <span className="text-sm tabular-nums">{formatRupees(dish.pricePaise)}</span>
                  ) : null}
                </div>
              </div>
              <Link
                href={`/${city}/dish/${dish.canonicalSlug}`}
                className="relative z-10 border-t-2 border-dashed border-ink/25 px-4 py-2.5 text-xs transition-colors duration-(--dur-instant) hover:bg-lime"
              >
                {t('discover.cityRankingLink', { dish: dish.canonicalName })}
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
