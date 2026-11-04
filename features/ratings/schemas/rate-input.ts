import { z } from 'zod';
import { sentimentSchema } from './sentiment';

export const aspectAnswerSchema = z.enum(['good', 'okay', 'poor']);
export const maxDishesPerSubmission = 20;

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
      (input.aspects !== null && Object.values(input.aspects).some((answer) => answer !== null)),
    'nothing to save',
  );

export type RateBranchInput = z.infer<typeof rateBranchInputSchema>;
