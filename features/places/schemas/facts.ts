import { z } from 'zod';

const clock = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/);

export const factValueSchemas = {
  hours: z.array(z.object({ dayOfWeek: z.number().int().min(0).max(6), opensAt: clock, closesAt: clock })),
  price_range: z.object({
    minPaise: z.number().int().nonnegative(),
    maxPaise: z.number().int().nonnegative(),
  }),
  phone: z.object({ phone: z.string().min(6) }),
  address: z.object({ address: z.string().min(3) }),
  payment_modes: z.object({ modes: z.array(z.enum(['cash', 'upi', 'card'])) }),
  veg_only: z.object({ vegOnly: z.boolean() }),
} as const;

export type FactField = keyof typeof factValueSchemas;
export type FactValue<F extends FactField> = z.infer<(typeof factValueSchemas)[F]>;
