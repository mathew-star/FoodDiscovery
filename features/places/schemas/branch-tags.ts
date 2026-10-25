import { z } from 'zod';

/** Occasion tags Ops sets on a branch; each one backs the context chip with the same id. */
export const branchTagSchema = z.enum(['rainy-day', 'date-night', 'family']);
export type BranchTag = z.infer<typeof branchTagSchema>;
