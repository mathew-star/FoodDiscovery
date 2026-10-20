import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DietMark } from '@/features/dishes/components/diet-mark';
import { DishPlate } from '@/features/dishes/components/dish-plate';
import { PlacedDishRow } from '@/features/dishes/components/placed-dish-row';
import { getBranchDish, getBranchDishParams, getCityDishRanking } from '@/features/dishes/queries/dishes';
import { breadcrumbJsonLd } from '@/features/places/lib/json-ld';
import { getBranch } from '@/features/places/queries/branches';
import { RatingDistribution } from '@/features/ratings/components/rating-distribution';
import { ScoreBadge } from '@/features/ratings/components/score-badge';
import { getRankingConfig } from '@/features/ratings/queries/ranking-config';
import { t } from '@/i18n';
import { siteUrl } from '@/shared/config/site';
import { formatRupees } from '@/shared/lib/money';
import { Badge } from '@/shared/ui/badge';
import { Breadcrumbs } from '@/shared/ui/breadcrumbs';
import { buttonVariants } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
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

  return (
    <div className="flex flex-col gap-8">
      <JsonLd
        data={breadcrumbJsonLd(
          crumbs.map((crumb) => ({ name: crumb.label, url: new URL(crumb.href, siteUrl).toString() })),
        )}
      />
      <Breadcrumbs label={t('common.breadcrumb')} items={crumbs} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-10">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <DishPlate name={dish.name} className="size-28 rounded-lg sm:size-36" />
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold md:text-4xl">{dish.name}</h1>
              <p className="text-muted">
                <Link
                  href={`/r/${branch.slug}`}
                  className="underline-offset-4 hover:text-text hover:underline"
                >
                  {t('dish.atBranch', { branch: dish.branchName })}
                </Link>
                {' · '}
                {dish.localityName}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {dish.pricePaise !== null ? (
                  <span className="text-xl font-semibold tabular-nums">{formatRupees(dish.pricePaise)}</span>
                ) : null}
                <DietMark diet={dish.diet} showLabel size="md" className="text-sm" />
                {dish.isJain ? <Badge>{t('dish.jain')}</Badge> : null}
              </div>
              <ScoreBadge
                lovedPct={rated ? dish.lovedPct : null}
                ratingCount={dish.ratingCount}
                withInfo
                size="md"
              />
            </div>
          </header>

          {dish.description ? <p className="max-w-prose text-lg">{dish.description}</p> : null}

          <section aria-labelledby="same-dish" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="same-dish" className="text-2xl font-semibold">
                {t('dish.sameDishElsewhere')}
              </h2>
              {dish.canonicalSlug && dish.canonicalName ? (
                <Link
                  href={`/${branch.citySlug}/dish/${dish.canonicalSlug}`}
                  className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                >
                  {t('dish.seeCityRanking', { dish: dish.canonicalName, city: branch.cityName })}
                </Link>
              ) : null}
            </div>
            {elsewhere.length === 0 ? (
              <p className="text-muted">{t('dish.sameDishEmpty')}</p>
            ) : (
              <ol className="flex flex-col gap-3">
                {elsewhere.slice(0, 6).map((entry) => (
                  <li key={entry.id}>
                    <PlacedDishRow dish={entry} minWeightForDisplay={scoring.minWeightForDisplay} />
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside>
          <Card className="flex flex-col gap-4 p-4 lg:sticky lg:top-24">
            <h2 className="font-sans text-lg font-semibold">{t('rating.distributionLabel')}</h2>
            <RatingDistribution
              weights={{
                loved: dish.lovedWeight,
                good: dish.goodWeight,
                okay: dish.okayWeight,
                skip: dish.skipWeight,
              }}
            />
            <p className="text-sm text-muted">
              {dish.ratingCount === 1
                ? t('rating.basedOnOne')
                : t('rating.basedOn', { count: dish.ratingCount })}
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
