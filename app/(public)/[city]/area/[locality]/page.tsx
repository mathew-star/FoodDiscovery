import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PlacedDishRow } from '@/features/dishes/components/placed-dish-row';
import { getLocalityTopDishes } from '@/features/dishes/queries/dishes';
import { citySlugs, parseCitySlug } from '@/features/geo/schemas/city';
import { getLocalities, getLocality } from '@/features/geo/queries/geo';
import { BranchCard } from '@/features/places/components/branch-card';
import { getLocalityBranches } from '@/features/places/queries/branches';
import { getRankingConfig } from '@/features/ratings/queries/ranking-config';
import { t } from '@/i18n';
import { Breadcrumbs } from '@/shared/ui/breadcrumbs';
import { EmptyState } from '@/shared/ui/empty-state';

export async function generateStaticParams() {
  const perCity = await Promise.all(
    citySlugs.map(async (city) =>
      (await getLocalities(city)).map((locality) => ({ city, locality: locality.slug })),
    ),
  );
  return perCity.flat();
}

async function load(params: PageProps<'/[city]/area/[locality]'>['params']) {
  const { city, locality } = await params;
  return parseCitySlug(city) ? getLocality(city, locality) : null;
}

export async function generateMetadata({ params }: PageProps<'/[city]/area/[locality]'>): Promise<Metadata> {
  const locality = await load(params);
  if (!locality) return {};
  return {
    title: t('area.title', { area: locality.name }),
    description: t('area.metaDescription', { area: locality.name, city: locality.city.name }),
    alternates: { canonical: `/${locality.city.slug}/area/${locality.slug}` },
  };
}

export default async function AreaPage({ params }: PageProps<'/[city]/area/[locality]'>) {
  const locality = await load(params);
  if (!locality) notFound();
  const [dishes, branches, scoring] = await Promise.all([
    getLocalityTopDishes(locality.id),
    getLocalityBranches(locality.id),
    getRankingConfig('dish_scoring'),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs
        label={t('common.breadcrumb')}
        items={[
          { href: `/${locality.city.slug}`, label: locality.city.name },
          { href: `/${locality.city.slug}/area/${locality.slug}`, label: locality.name },
        ]}
      />
      <header className="flex max-w-4xl flex-col gap-4">
        <p className="w-fit border-2 border-ink bg-raised px-2 py-0.5 font-mono text-2xs font-bold tracking-widest uppercase">
          {t('area.kicker')}
        </p>
        <h1 className="rise-in text-[clamp(3rem,9vw,6.5rem)] leading-[0.88] font-extrabold [font-stretch:72%]">
          {t('area.title', { area: locality.name })}
        </h1>
        <p className="max-w-2xl text-lg text-ink-soft">
          {t('area.intro', { area: locality.name, city: locality.city.name })}
        </p>
      </header>
      <div className="grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="area-dishes" className="flex flex-col gap-4">
          <h2 id="area-dishes" className="text-5xl font-extrabold">
            {t('area.topDishes', { area: locality.name })}
          </h2>
          {dishes.length === 0 ? (
            <EmptyState title={t('area.empty')} />
          ) : (
            <ol className="flex flex-col gap-4">
              {dishes.map((dish, index) => (
                <li key={dish.id}>
                  <PlacedDishRow
                    dish={dish}
                    rank={index + 1}
                    minWeightForDisplay={scoring.minWeightForDisplay}
                  />
                </li>
              ))}
            </ol>
          )}
        </section>
        <section aria-labelledby="area-places" className="flex flex-col gap-4">
          <h2 id="area-places" className="text-5xl font-extrabold">
            {t('area.topPlaces', { area: locality.name })}
          </h2>
          {branches.length === 0 ? (
            <EmptyState title={t('area.empty')} />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {branches.map((branch) => (
                <li key={branch.id}>
                  <BranchCard branch={branch} timezone={locality.city.timezone} showLocality={false} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
