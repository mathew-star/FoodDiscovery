import { z } from 'zod';

/** Spec W2 / DESIGN-SYSTEM §9.1: guests keep up to 20 saves on the device; the 21st asks to sign in. */
export const deviceSaveLimit = 20;
export const deviceSavesStorageKey = 'fdn:saves';

export const deviceSaveSchema = z.object({
  kind: z.enum(['branch', 'dish']),
  // branch id, or branch dish id
  id: z.uuid(),
  branchId: z.uuid(),
  name: z.string().min(1).max(120),
  detail: z.string().max(160),
  href: z.string().startsWith('/').max(200),
  diet: z.enum(['veg', 'egg', 'nonveg']).nullable(),
  savedAt: z.number().int().nonnegative(),
});
export type DeviceSave = z.infer<typeof deviceSaveSchema>;

/** Tolerates hand-edited or older storage: invalid entries are dropped, never thrown. */
export function parseDeviceSaves(raw: string | null): DeviceSave[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const saves = value.flatMap((entry) => {
      const parsed = deviceSaveSchema.safeParse(entry);
      return parsed.success ? [parsed.data] : [];
    });
    return dedupe(saves).slice(0, deviceSaveLimit);
  } catch {
    return [];
  }
}

function dedupe(saves: DeviceSave[]): DeviceSave[] {
  const seen = new Set<string>();
  return saves.filter((save) => {
    const key = `${save.kind}:${save.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export type ToggleResult =
  { outcome: 'saved' | 'removed'; saves: DeviceSave[] } | { outcome: 'full'; saves: DeviceSave[] };

export function toggleDeviceSave(saves: readonly DeviceSave[], item: DeviceSave): ToggleResult {
  const exists = saves.some((save) => save.kind === item.kind && save.id === item.id);
  if (exists) {
    return {
      outcome: 'removed',
      saves: saves.filter((save) => !(save.kind === item.kind && save.id === item.id)),
    };
  }
  if (saves.length >= deviceSaveLimit) return { outcome: 'full', saves: [...saves] };
  return { outcome: 'saved', saves: [item, ...saves] };
}
