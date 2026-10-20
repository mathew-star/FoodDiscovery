import type { MetadataRoute } from 'next';
import { citySlugs } from '@/features/geo/schemas/city';
import { siteUrl } from '@/shared/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...citySlugs.map((city) => `/${city}`), '/about', '/guidelines'];
  return paths.map((path) => ({ url: new URL(path, siteUrl).toString() }));
}
