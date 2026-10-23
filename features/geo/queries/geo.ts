import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { findCityBySlug, findLocality, listLocalities } from '../server/repo';

export async function getCity(slug: string) {
  'use cache';
  cacheLife('cuisine');
  cacheTag(`city:${slug}`);
  return findCityBySlug(slug);
}

export async function getLocalities(citySlug: string) {
  'use cache';
  cacheLife('cuisine');
  cacheTag(`city:${citySlug}`, 'localities');
  const city = await findCityBySlug(citySlug);
  return city ? listLocalities(city.id) : [];
}

export async function getLocality(citySlug: string, localitySlug: string) {
  'use cache';
  cacheLife('catalog');
  cacheTag(`city:${citySlug}`, `locality-slug:${localitySlug}`);
  const city = await findCityBySlug(citySlug);
  if (!city) return null;
  const locality = await findLocality(city.id, localitySlug);
  if (locality) cacheTag(`locality:${locality.id}`);
  return locality ? { ...locality, city } : null;
}
