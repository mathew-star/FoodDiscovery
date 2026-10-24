import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DietMark } from '@/features/dishes/components/diet-mark';
import { LeaderboardList, PlacedDishRow } from '@/features/dishes/components/placed-dish-row';
import { getBranchDish, getBranchDishParams, getCityDishRanking } from '@/features/dishes/queries/dishes';
import { breadcrumbJsonLd } from '@/features/places/lib/json-ld';
import { getBranch } from '@/features/places/queries/branches';
import { RatingDistribution } from '@/features/ratings/components/rating-distribution';
import { ScoreBadge } from '@/features/ratings/components/score-badge';
import { VerdictBar } from '@/features/ratings/components/verdict-bar';
import { verdictShares } from '@/features/ratings/lib/verdict-shares';
import { getRankingConfig } from '@/features/ratings/queries/ranking-config';
import { t } from '@/i18n';
import { siteUrl } from '@/shared/config/site';
import { cn } from '@/shared/lib/cn';
import { formatRupees } from '@/shared/lib/money';
import { Badge } from '@/shared/ui/badge';
import { Breadcrumbs } from '@/shared/ui/breadcrumbs';
import { buttonVariants } from '@/shared/ui/button';
import { cardVariants } from '@/shared/ui/card';
import { ImageSlot } from '@/shared/ui/image-slot';
import { JsonLd } from '@/shared/ui/json-ld';

export async function generateStaticParams() {
  return (await getBranchDishParams()).map(({ branch, dish }) => ({ branch, branchDish: dish }));
}

export async function generateMetadata({
  params,
}: PageProps<'/r/[branch]/dish/[branchDish]'>): Promise<Metadata> {
  const { branch: branchSlug, branchDish } = await params;
  const dish = await getBranchDish(branchSlug, branchDish);
  if (!dish) return {};
  return {
    title: `${dish.name} at ${dish.branchName}`,
    description: t('dish.metaDescription', {
      dish: dish.name,
      branch: dish.branchName,
      locality: dish.localityName,
      price: dish.pricePaise === null ? '' : formatRupees(dish.pricePaise),
    }),
    alternates: { canonical: `/r/${dish.branchSlug}/dish/${dish.slug}` },
  };
}

export default async function BranchDishPage({ params }: PageProps<'/r/[branch]/dish/[branchDish]'>) {
  const { branch: branchSlug, branchDish } = await params;
  const [dish, scoring] = await Promise.all([
    getBranchDish(branchSlug, branchDish),
    getRankingConfig('dish_scoring'),
  ]);
  if (!dish) notFound();
  const branch = await getBranch(dish.branchSlug);
  if (!branch) notFound();

  const elsewhere = dish.canonicalDishId
    ? (await getCityDishRanking(dish.canonicalDishId, dish.cityId)).dishes.filter(
        (entry) => entry.id !== dish.id,
      )
    : [];
  const rated = dish.weightSum >= scoring.minWeightForDisplay;
  const path = `/r/${dish.branchSlug}/dish/${dish.slug}`;
  const crumbs = [
    { href: `/${branch.citySlug}`, label: branch.cityName },
    { href: `/r/${branch.slug}`, label: branch.name },
    { href: path, label: dish.name },
  ];

  const weights = {
    loved: dish.lovedWeight,
    good: dish.goodWeight,
    okay: dish.okayWeight,
    skip: dish.skipWeight,
  };
  const basedOn =
    dish.ratingCount === 1 ? t('rating.basedOnOne') : t('rating.basedOn', { count: dish.ratingCount });

  return (
    <div className="flex flex-col gap-8">
      <JsonLd
        data={breadcrumbJsonLd(
          crumbs.map((crumb) => ({ name: crumb.label, url: new URL(crumb.href, siteUrl).toString() })),
        )}
      />
      <Breadcrumbs label={t('common.breadcrumb')} items={crumbs} />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="flex min-w-0 flex-col gap-14">
          <header className={cn(cardVariants({ size: 'lg' }), 'flex flex-col overflow-hidden md:flex-row')}>
            <ImageSlot
              label={t('imageSlot.dishPhoto', { width: 800, height: 1000 })}
              className="aspect-[4/5] w-full shrink-0 border-b-2 border-ink md:w-56 md:border-r-2 md:border-b-0"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 md:p-7">
              <p className="text-xs text-inkMuted">
                <Link
                  href={`/r/${branch.slug}`}
                  className="text-ink underline underline-offset-4 hover:text-terracottaDeep"
                >
                  {t('dish.atBranch', { branch: dish.branchName })}
                </Link>
                {' · '}
                {dish.localityName}
              </p>
              <h1 className="type-display-l">{dish.name}</h1>
              <div className="flex flex-wrap items-center gap-3">
                {dish.pricePaise !== null ? (
                  <span className="font-display text-2xl font-extrabold tabular-nums">
                    {formatRupees(dish.pricePaise)}
                  </span>
                ) : null}
                <DietMark diet={dish.diet} showLabel size="md" className="text-sm" />
                {dish.isJain ? <Badge>{t('dish.jain')}</Badge> : null}
              </div>
              <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t-2 border-dashed border-ink/25 pt-4">
                <ScoreBadge
                  lovedPct={rated ? dish.lovedPct : null}
                  ratingCount={dish.ratingCount}
                  size="lg"
                  withInfo
                />
                {rated ? <VerdictBar shares={verdictShares(weights)} className="w-full max-w-xs" /> : null}
              </div>
            </div>
          </header>

          {dish.description ? (
            <p className="max-w-prose text-lg leading-relaxed">{dish.description}</p>
          ) : null}

          <section aria-labelledby="same-dish" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 id="same-dish" className="type-title-l">
                  {t('dish.sameDishElsewhere')}
                </h2>
                <p className="text-sm text-inkMuted">{t('dish.sameDishBody')}</p>
              </div>
              {dish.canonicalSlug && dish.canonicalName ? (
                <Link
                  href={`/${branch.citySlug}/dish/${dish.canonicalSlug}`}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  {t('dish.seeCityRanking', { dish: dish.canonicalName, city: branch.cityName })}
                </Link>
              ) : null}
            </div>
            {elsewhere.length === 0 ? (
              <p className="text-inkMuted">{t('dish.sameDishEmpty')}</p>
            ) : (
              <LeaderboardList>
                {elsewhere.slice(0, 6).map((entry, index) => (
                  <li key={entry.id}>
                    <PlacedDishRow
                      dish={entry}
                      rank={index + 1}
                      minWeightForDisplay={scoring.minWeightForDisplay}
                      showDishName={false}
                    />
                  </li>
                ))}
              </LeaderboardList>
            )}
          </section>
        </div>

        <aside>
          <section
            aria-labelledby="breakdown"
            className={cn(cardVariants({ size: 'md' }), 'p-5 lg:sticky lg:top-24')}
          >
            <h2 id="breakdown" className="type-title-m">
              {t('rating.distributionLabel')}
            </h2>
            <p className="mb-5 text-xs text-inkMuted">{t('dish.breakdownBody')}</p>
            <RatingDistribution weights={weights} />
            <p className="mt-5 text-xs text-inkMuted">{basedOn}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
