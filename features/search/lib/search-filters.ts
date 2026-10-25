import { distanceMeters, type LatLng } from '@/shared/lib/geo';
import type { SearchFilters } from '../schemas/search-params';

export type FilterableDish = {
  localitySlug: string;
  cuisineSlug: string | null;
  diet: 'veg' | 'egg' | 'nonveg';
  branchPriceBand: number;
  branchLocation: LatLng;
};

/** E4-2. Distance applies only once the guest has shared location. */
export function matchesFilters(
  dish: FilterableDish,
  filters: SearchFilters,
  location: LatLng | null,
): boolean {
  if (filters.area && dish.localitySlug !== filters.area) return false;
  if (filters.cuisine && dish.cuisineSlug !== filters.cuisine) return false;
  if (filters.diet && dish.diet !== filters.diet) return false;
  if (filters.price && dish.branchPriceBand > filters.price) return false;
  if (filters.km && location && distanceMeters(location, dish.branchLocation) > filters.km * 1_000)
    return false;
  return true;
}

export const hasActiveFilters = (filters: SearchFilters) =>
  Boolean(filters.area || filters.cuisine || filters.diet || filters.price || filters.km);
