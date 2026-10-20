import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DiscoverHero } from '@/features/discover/components/discover-hero';
import { cityNameKey, citySlugs, parseCitySlug } from '@/features/geo/schemas/city';
import { t } from '@/i18n';

export function generateStaticParams() {
  return citySlugs.map((city) => ({ city }));
}

export async function generateMetadata({ params }: PageProps<'/[city]'>): Promise<Metadata> {
  const city = parseCitySlug((await params).city);
  if (!city) return {};
  const name = t(cityNameKey[city]);
  return {
    title: { absolute: `${t('app.name')} · ${t('app.tagline', { city: name })}` },
    alternates: { canonical: `/${city}` },
  };
}

export default async function CityDiscoverPage({ params }: PageProps<'/[city]'>) {
  const city = parseCitySlug((await params).city);
  if (!city) notFound();
  return <DiscoverHero city={city} />;
}
