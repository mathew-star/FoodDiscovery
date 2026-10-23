import type { MetadataRoute } from 'next';
import { getBranchDishParams, getCanonicalDishSlugs } from '@/features/dishes/queries/dishes';
import { citySlugs } from '@/features/geo/schemas/city';
import { getLocalities } from '@/features/geo/queries/geo';
import { getBranchSlugs, getCuisineSlugs } from '@/features/places/queries/branches';
import { siteUrl } from '@/shared/config/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [branches, branchDishes, dishes, cuisines, localityLists] = await Promise.all([
    getBranchSlugs(),
    getBranchDishParams(),
    getCanonicalDishSlugs(),
    getCuisineSlugs(),
    Promise.all(citySlugs.map(async (city) => ({ city, localities: await getLocalities(city) }))),
  ]);
  const paths = [
    '/',
    '/about',
    '/guidelines',
    ...citySlugs.map((city) => `/${city}`),
    ...localityLists.flatMap(({ city, localities }) =>
      localities.map((locality) => `/${city}/area/${locality.slug}`),
    ),
    ...citySlugs.flatMap((city) => dishes.map((dish) => `/${city}/dish/${dish}`)),
    ...citySlugs.flatMap((city) => cuisines.map((cuisine) => `/${city}/cuisine/${cuisine}`)),
    ...branches.map((branch) => `/r/${branch}`),
    ...branchDishes.map(({ branch, dish }) => `/r/${branch}/dish/${dish}`),
  ];
  return paths.map((path) => ({ url: new URL(path, siteUrl).toString() }));
}
