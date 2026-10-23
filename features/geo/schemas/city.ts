import { z } from 'zod';
import type { MessageKey } from '@/i18n';

export const citySlugs = ['hyderabad'] as const;
export const citySlugSchema = z.enum(citySlugs);
export type CitySlug = z.infer<typeof citySlugSchema>;

export const defaultCity: CitySlug = 'hyderabad';

export const cityNameKey: Record<CitySlug, MessageKey> = {
  hyderabad: 'city.hyderabad',
};

export function parseCitySlug(value: string): CitySlug | null {
  const parsed = citySlugSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
