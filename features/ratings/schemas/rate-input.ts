import { z } from 'zod';
import { sentimentSchema } from './sentiment';

export const aspectAnswerSchema = z.enum(['good', 'okay', 'poor']);
export const maxDishesPerSubmission = 20;
export const maxNewDishesPerSubmission = 5;

/** A dish the member ate that is not on the menu yet (docs/CONTRIBUTIONS.md §5.2). */
export const newDishInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  diet: z.enum(['veg', 'egg', 'nonveg']),
  pricePaise: z.int().min(100).max(10_000_00).nullable(),
  sentiment: sentimentSchema,
});
export type NewDishInput = z.infer<typeof newDishInputSchema>;

/** Spec W3 / E6-1, E6-2: dishes eaten with a verdict each, plus optional restaurant aspects. */
export const rateBranchInputSchema = z
  .object({
    branchId: z.uuid(),
    dishes: z
      .array(z.object({ branchDishId: z.uuid(), sentiment: sentimentSchema }))
      .max(maxDishesPerSubmission)
      .refine(
        (dishes) => new Set(dishes.map((dish) => dish.branchDishId)).size === dishes.length,
        'duplicate dish',
      ),
    newDishes: z.array(newDishInputSchema).max(maxNewDishesPerSubmission).default([]),
    aspects: z
      .object({
        value: aspectAnswerSchema.nullable(),
        service: aspectAnswerSchema.nullable(),
        ambience: aspectAnswerSchema.nullable(),
        wouldReturn: z.boolean().nullable(),
      })
      .nullable(),
  })
  .refine(
    (input) =>
      input.dishes.length > 0 ||
      input.newDishes.length > 0 ||
      (input.aspects !== null && Object.values(input.aspects).some((answer) => answer !== null)),
    'nothing to save',
  );

export type RateBranchInput = z.infer<typeof rateBranchInputSchema>;
