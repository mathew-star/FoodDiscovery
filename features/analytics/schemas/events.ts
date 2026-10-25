import { z } from 'zod';
import { contextChipIdSchema } from '@/features/search/schemas/context-chips';

export const analyticsSurfaceSchema = z.enum([
  'landing',
  'discover',
  'search',
  'branch',
  'branch_dish',
  'city_dish',
  'area',
  'cuisine',
  'saved',
]);
export type AnalyticsSurface = z.infer<typeof analyticsSurfaceSchema>;

const query = z.string().trim().min(1).max(80);
const surface = analyticsSurfaceSchema;
const branchId = z.uuid();
const branchDishId = z.uuid();
const position = z.int().min(0).max(200);

/*
  Events a browser may send to /api/events. Server-emitted events (rate_submit, post_publish, …)
  join this union with their phase. Objects are strict so a client cannot smuggle extra props.
*/
export const clientEventSchema = z.discriminatedUnion('name', [
  z.strictObject({ name: z.literal('page_view'), path: z.string().startsWith('/').max(200) }),
  z.strictObject({
    name: z.literal('search'),
    query,
    resultCount: z.int().min(0).max(1000),
    chips: z.array(contextChipIdSchema).max(10),
  }),
  z.strictObject({
    name: z.literal('search_result_click'),
    query,
    kind: z.enum(['dish', 'branch', 'area', 'cuisine']),
    position,
    branchId: branchId.optional(),
    branchDishId: branchDishId.optional(),
  }),
  z.strictObject({ name: z.literal('chip_toggle'), chip: contextChipIdSchema, on: z.boolean(), surface }),
  z.strictObject({ name: z.literal('directions_click'), branchId, surface }),
  z.strictObject({ name: z.literal('call_click'), branchId, surface }),
  z.strictObject({
    name: z.literal('share'),
    method: z.enum(['native', 'copy']),
    surface,
    branchId: branchId.optional(),
    branchDishId: branchDishId.optional(),
  }),
  z.strictObject({
    name: z.literal('save'),
    on: z.boolean(),
    surface,
    branchId,
    branchDishId: branchDishId.optional(),
  }),
  z.strictObject({
    name: z.literal('location_prompt'),
    outcome: z.enum(['granted', 'denied', 'dismissed', 'unavailable']),
  }),
]);
export type ClientEvent = z.infer<typeof clientEventSchema>;

export const clientEventBatchSchema = z.strictObject({ events: z.array(clientEventSchema).min(1).max(20) });
export type ClientEventBatch = z.infer<typeof clientEventBatchSchema>;
