import { z } from 'zod';
import { deviceSaveLimit } from '../lib/device-saves';

/** What a Save button points at: a branch, or one dish at a branch. */
export const saveTargetSchema = z
  .object({ kind: z.enum(['branch', 'dish']), id: z.uuid(), branchId: z.uuid() })
  .refine(
    (target) => target.kind === 'dish' || target.id === target.branchId,
    'branch saves use the branch id',
  );
export type SaveTarget = z.infer<typeof saveTargetSchema>;

export const importDeviceSavesInputSchema = z.array(saveTargetSchema).max(deviceSaveLimit);

/** Stable key shared by client and server: `branch:<id>` or `dish:<id>`. */
export const saveKey = (target: Pick<SaveTarget, 'kind' | 'id'>) => `${target.kind}:${target.id}`;

export const maxListItems = 100;
