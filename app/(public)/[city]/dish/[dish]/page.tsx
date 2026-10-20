import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CityDishResults } from '@/features/dishes/components/city-dish-results';
import {
  getCanonicalDish,
  getCanonicalDishSlugs,
  getCityDishRanking,
} from '@/features/dishes/queries/dishes';
import { citySlugs, parseCitySlug } from '@/features/geo/schemas/city';
import { getCity, getLocalities } from '@/features/geo/queries/geo';
import { breadcrumbJsonLd } from '@/features/places/lib/json-ld';
import { t } from '@/i18n';
import { siteUrl } from '@/shared/config/site';
import { Breadcrumbs } from '@/shared/ui/breadcrumbs';
import { JsonLd } from '@/shared/ui/json-ld';
import { Skeleton } from '@/shared/ui/skeleton';

export async function generateStaticParams() {
  const dishes = await getCanonicalDishSlugs();
  return citySlugs.flatMap((city) => dishes.map((dish) => ({ city, dish })));
}

async function load(params: PageProps<'/[city]/dish/[dish]'>['params']) {
  const { city: citySlug, dish: dishSlug } = await params;
  if (!parseCitySlug(citySlug)) return null;
  const [city, dish] = await Promise.all([getCity(citySlug), getCanonicalDish(dishSlug)]);
  return city && dish ? { city, dish } : null;
}

export async function generateMetadata({ params }: PageProps<'/[city]/dish/[dish]'>): Promise<Metadata> {
  const data = await load(params);
  if (!data) return {};
  return {
    title: t('dish.cityTitle', { dish: data.dish.name, city: data.city.name }),
    description: t('dish.cityMetaDescription', { dish: data.dish.name, city: data.city.name }),
    alternates: { canonical: `/${data.city.slug}/dish/${data.dish.slug}` },
  };
}

export default async function CityDishPage({ params, searchParams }: PageProps<'/[city]/dish/[dish]'>) {
  const data = await load(params);
  if (!data) notFound();
  const { city, dish } = data;
  const [ranking, areas] = await Promise.all([
    getCityDishRanking(dish.id, city.id),
    getLocalities(city.slug),
  ]);
  const path = `/${city.slug}/dish/${dish.slug}`;
  const crumbs = [
    { href: `/${city.slug}`, label: city.name },
    { href: path, label: dish.name },
  ];

  return (
    <div className="flex flex-col gap-6">
      <JsonLd
        data={{
          '@graph': [
            breadcrumbJsonLd(
              crumbs.map((crumb) => ({ name: crumb.label, url: new URL(crumb.href, siteUrl).toString() })),
            ),
            {
              '@type': 'ItemList',
              name: t('dish.cityTitle', { dish: dish.name, city: city.name }),
              itemListElement: ranking.dishes.slice(0, 10).map((entry, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: new URL(`/r/${entry.branchSlug}/dish/${entry.slug}`, siteUrl).toString(),
                name: `${entry.name} at ${entry.branchName}`,
              })),
            },
          ],
        }}
      />
      <Breadcrumbs label={t('common.breadcrumb')} items={crumbs} />
      <header className="flex max-w-3xl flex-col gap-2">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">{dish.categoryName}</p>
        <h1 className="text-3xl font-semibold md:text-4xl">
          {t('dish.cityTitle', { dish: dish.name, city: city.name })}
        </h1>
        <p className="text-lg text-muted">{t('dish.cityIntro', { dish: dish.name, city: city.name })}</p>
        {dish.description ? <p>{dish.description}</p> : null}
      </header>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <CityDishResults
          searchParams={searchParams}
          path={path}
          dishes={ranking.dishes}
          areas={areas.map(({ slug, name }) => ({ slug, name }))}
          timezone={city.timezone}
          minWeightForDisplay={ranking.minWeightForDisplay}
        />
      </Suspense>
    </div>
  );
}
