import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PlacedDishRow } from '@/features/dishes/components/placed-dish-row';
import { getCuisineTopDishes } from '@/features/dishes/queries/dishes';
import { citySlugs, parseCitySlug } from '@/features/geo/schemas/city';
import { getCity } from '@/features/geo/queries/geo';
import { BranchCard } from '@/features/places/components/branch-card';
import { getCuisine, getCuisineBranches, getCuisineSlugs } from '@/features/places/queries/branches';
import { getRankingConfig } from '@/features/ratings/queries/ranking-config';
import { t } from '@/i18n';
import { Breadcrumbs } from '@/shared/ui/breadcrumbs';
import { EmptyState } from '@/shared/ui/empty-state';

export async function generateStaticParams() {
  const cuisines = await getCuisineSlugs();
  return citySlugs.flatMap((city) => cuisines.map((cuisine) => ({ city, cuisine })));
}

async function load(params: PageProps<'/[city]/cuisine/[cuisine]'>['params']) {
  const { city: citySlug, cuisine: cuisineSlug } = await params;
  if (!parseCitySlug(citySlug)) return null;
  const [city, cuisine] = await Promise.all([getCity(citySlug), getCuisine(cuisineSlug)]);
  return city && cuisine ? { city, cuisine } : null;
}

export async function generateMetadata({
  params,
}: PageProps<'/[city]/cuisine/[cuisine]'>): Promise<Metadata> {
  const data = await load(params);
  if (!data) return {};
  return {
    title: t('cuisine.title', { cuisine: data.cuisine.name, city: data.city.name }),
    description: t('cuisine.metaDescription', { cuisine: data.cuisine.name, city: data.city.name }),
    alternates: { canonical: `/${data.city.slug}/cuisine/${data.cuisine.slug}` },
  };
}

export default async function CuisinePage({ params }: PageProps<'/[city]/cuisine/[cuisine]'>) {
  const data = await load(params);
  if (!data) notFound();
  const { city, cuisine } = data;
  const [dishes, branches, scoring] = await Promise.all([
    getCuisineTopDishes(city.id, cuisine.id),
    getCuisineBranches(city.id, cuisine.id),
    getRankingConfig('dish_scoring'),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs
        label={t('common.breadcrumb')}
        items={[
          { href: `/${city.slug}`, label: city.name },
          { href: `/${city.slug}/cuisine/${cuisine.slug}`, label: cuisine.name },
        ]}
      />
      <header className="flex max-w-4xl flex-col gap-4">
        <p className="w-fit border-2 border-ink bg-raised px-2 py-0.5 font-mono text-2xs font-bold tracking-widest uppercase">
          {t('cuisine.kicker')}
        </p>
        <h1 className="rise-in text-[clamp(3rem,9vw,6.5rem)] leading-[0.88] font-extrabold [font-stretch:72%]">
          {t('cuisine.title', { cuisine: cuisine.name, city: city.name })}
        </h1>
        <p className="max-w-2xl text-lg text-ink-soft">
          {t('cuisine.intro', { cuisine: cuisine.name, city: city.name })}
        </p>
      </header>
      <div className="grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="cuisine-dishes" className="flex flex-col gap-4">
          <h2 id="cuisine-dishes" className="text-5xl font-extrabold">
            {t('cuisine.topDishes', { cuisine: cuisine.name })}
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
        <section aria-labelledby="cuisine-places" className="flex flex-col gap-4">
          <h2 id="cuisine-places" className="text-5xl font-extrabold">
            {t('cuisine.topPlaces', { cuisine: cuisine.name })}
          </h2>
          {branches.length === 0 ? (
            <EmptyState title={t('area.empty')} />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {branches.map((branch) => (
                <li key={branch.id}>
                  <BranchCard branch={branch} timezone={city.timezone} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
