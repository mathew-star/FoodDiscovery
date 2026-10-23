import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DietMark } from '@/features/dishes/components/diet-mark';
import { DishTile } from '@/features/dishes/components/dish-tile';
import { PlacedDishRow } from '@/features/dishes/components/placed-dish-row';
import { getBranchDish, getBranchDishParams, getCityDishRanking } from '@/features/dishes/queries/dishes';
import { breadcrumbJsonLd } from '@/features/places/lib/json-ld';
import { getBranch } from '@/features/places/queries/branches';
import { RatingDistribution } from '@/features/ratings/components/rating-distribution';
import { ScoreBadge } from '@/features/ratings/components/score-badge';
import { ScoreInfo } from '@/features/ratings/components/score-info.client';
import { getRankingConfig } from '@/features/ratings/queries/ranking-config';
import { t } from '@/i18n';
import { siteUrl } from '@/shared/config/site';
import { formatRupees } from '@/shared/lib/money';
import { Badge } from '@/shared/ui/badge';
import { Breadcrumbs } from '@/shared/ui/breadcrumbs';
import { buttonVariants } from '@/shared/ui/button';
import { CountUp } from '@/shared/ui/count-up.client';
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
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="flex min-w-0 flex-col gap-14">
          <header aria-label={t('dish.ticketLabel')} className="drop-shadow-[6px_6px_0_var(--lift-color)]">
            <div className="flex flex-col gap-6 bg-raised p-5 pb-10 perforate-b md:flex-row md:p-8 md:pb-12">
              <DishTile name={dish.name} size="xl" />
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <p className="font-mono text-xs tracking-wide uppercase">
                  <Link
                    href={`/r/${branch.slug}`}
                    className="underline decoration-rule-strong decoration-2 underline-offset-4 hover:decoration-ink"
                  >
                    {t('dish.atBranch', { branch: dish.branchName })}
                  </Link>
                  {' / '}
                  {dish.localityName}
                </p>
                <h1 className="rise-in text-6xl font-extrabold md:text-7xl">{dish.name}</h1>
                <div className="flex flex-wrap items-center gap-4 font-mono">
                  {dish.pricePaise !== null ? (
                    <span className="text-2xl font-bold tabular-nums">{formatRupees(dish.pricePaise)}</span>
                  ) : null}
                  <DietMark diet={dish.diet} showLabel size="md" className="text-sm" />
                  {dish.isJain ? <Badge>{t('dish.jain')}</Badge> : null}
                </div>
                {rated && dish.lovedPct !== null ? (
                  <p className="flex items-end gap-3 text-rate-loved">
                    <CountUp
                      value={Math.round(dish.lovedPct)}
                      suffix="%"
                      className="font-display text-8xl leading-[0.8] font-extrabold [font-stretch:68%] tabular-nums"
                    />
                    <span className="flex flex-col pb-1">
                      <span className="flex items-center gap-1 font-display text-2xl font-bold uppercase [font-stretch:80%]">
                        {t('rating.lovedWord')}
                        <ScoreInfo label={t('rating.scoreInfoLabel')} content={t('rating.scoreInfo')} />
                      </span>
                      <span className="font-mono text-2xs text-ink-soft uppercase">
                        {dish.ratingCount === 1
                          ? t('rating.basedOnOne')
                          : t('rating.basedOn', { count: dish.ratingCount })}
                      </span>
                    </span>
                  </p>
                ) : (
                  <ScoreBadge lovedPct={null} ratingCount={dish.ratingCount} withInfo />
                )}
              </div>
            </div>
          </header>

          {dish.description ? (
            <p className="max-w-prose text-xl leading-relaxed">{dish.description}</p>
          ) : null}

          <section aria-labelledby="same-dish" className="flex flex-col gap-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p className="font-mono text-xs tracking-widest text-ink-soft uppercase">
                  {t('dish.elsewhereKicker')}
                </p>
                <h2 id="same-dish" className="text-5xl font-extrabold md:text-6xl">
                  {t('dish.sameDishElsewhere')}
                </h2>
              </div>
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
              <p className="text-ink-soft">{t('dish.sameDishEmpty')}</p>
            ) : (
              <ol className="flex flex-col gap-4">
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
              </ol>
            )}
          </section>
        </div>

        <aside>
          <section
            aria-labelledby="breakdown"
            className="border-2 border-ink bg-raised p-5 shadow-lift lg:sticky lg:top-24"
          >
            <p className="font-mono text-2xs tracking-widest text-ink-soft uppercase">
              {t('dish.breakdownKicker')}
            </p>
            <h2 id="breakdown" className="mb-5 text-4xl font-extrabold">
              {t('rating.distributionLabel')}
            </h2>
            <RatingDistribution
              weights={{
                loved: dish.lovedWeight,
                good: dish.goodWeight,
                okay: dish.okayWeight,
                skip: dish.skipWeight,
              }}
            />
            <p className="mt-5 font-mono text-2xs text-ink-soft uppercase">
              {dish.ratingCount === 1
                ? t('rating.basedOnOne')
                : t('rating.basedOn', { count: dish.ratingCount })}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
