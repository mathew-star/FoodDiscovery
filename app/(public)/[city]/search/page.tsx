import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { citySlugs, parseCitySlug } from '@/features/geo/schemas/city';
import { getCity } from '@/features/geo/queries/geo';
import { SearchSection } from '@/features/search/components/search-section';
import { t } from '@/i18n';
import { Skeleton } from '@/shared/ui/skeleton';

export function generateStaticParams() {
  return citySlugs.map((city) => ({ city }));
}

async function load(params: PageProps<'/[city]/search'>['params']) {
  const { city } = await params;
  return parseCitySlug(city) ? getCity(city) : null;
}

export async function generateMetadata({ params }: PageProps<'/[city]/search'>): Promise<Metadata> {
  const city = await load(params);
  if (!city) return {};
  return {
    title: t('search.pageTitle', { city: city.name }),
    description: t('search.metaDescription', { city: city.name }),
    alternates: { canonical: `/${city.slug}/search` },
    // Result pages are endless query permutations; the catalogue pages are what should rank.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ params, searchParams }: PageProps<'/[city]/search'>) {
  const city = await load(params);
  if (!city) notFound();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="type-display-l">{t('search.pageTitle', { city: city.name })}</h1>
      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        }
      >
        <SearchSection city={city} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
