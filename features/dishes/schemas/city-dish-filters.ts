import { z } from 'zod';

const single = (value: unknown) => (Array.isArray(value) ? value[0] : value);

export const priceCaps = [150, 300, 500, 1000] as const;

export const cityDishFiltersSchema = z.object({
  area: z.preprocess(
    single,
    z
      .string()
      .regex(/^[a-z0-9-]{1,60}$/)
      .optional()
      .catch(undefined),
  ),
  maxPrice: z.preprocess(
    single,
    z.coerce
      .number()
      .int()
      .refine((value) => (priceCaps as readonly number[]).includes(value))
      .optional()
      .catch(undefined),
  ),
  open: z.preprocess(single, z.literal('1').optional().catch(undefined)),
});

export type CityDishFilters = z.infer<typeof cityDishFiltersSchema>;
