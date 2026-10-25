import { describe, expect, it } from 'vitest';
import { deviceSaveLimit, parseDeviceSaves, toggleDeviceSave, type DeviceSave } from './device-saves';

const id = (n: number) => `01920000-0000-7000-8000-${String(n).padStart(12, '0')}`;
const save = (n: number, overrides: Partial<DeviceSave> = {}): DeviceSave => ({
  kind: 'dish',
  id: id(n),
  branchId: id(1000 + n),
  name: `Dish ${n}`,
  detail: 'Somewhere',
  href: `/r/place/dish/dish-${n}`,
  diet: 'veg',
  savedAt: n,
  ...overrides,
});

describe('toggleDeviceSave', () => {
  it('adds newest first and removes on a second toggle', () => {
    const first = toggleDeviceSave([], save(1));
    expect(first).toMatchObject({ outcome: 'saved' });
    const second = toggleDeviceSave(first.saves, save(2));
    expect(second.saves.map((entry) => entry.id)).toEqual([id(2), id(1)]);
    expect(toggleDeviceSave(second.saves, save(1))).toMatchObject({ outcome: 'removed', saves: [save(2)] });
  });

  it('refuses the 21st save but still allows removing one', () => {
    const full = Array.from({ length: deviceSaveLimit }, (_, n) => save(n));
    expect(toggleDeviceSave(full, save(99))).toMatchObject({ outcome: 'full' });
    expect(toggleDeviceSave(full, save(3)).outcome).toBe('removed');
  });

  it('treats a branch and a dish with the same id as different saves', () => {
    const saves = toggleDeviceSave([], save(1)).saves;
    expect(toggleDeviceSave(saves, save(1, { kind: 'branch' })).outcome).toBe('saved');
  });
});

describe('parseDeviceSaves', () => {
  it('drops invalid, duplicate and overflow entries', () => {
    const raw = JSON.stringify([
      save(1),
      save(1),
      { ...save(2), href: 'https://evil.example' },
      'junk',
      ...Array.from({ length: 30 }, (_, n) => save(10 + n)),
    ]);
    const saves = parseDeviceSaves(raw);
    expect(saves).toHaveLength(deviceSaveLimit);
    expect(saves[0]?.id).toBe(id(1));
    expect(saves.some((entry) => entry.id === id(2))).toBe(false);
  });

  it('returns nothing for empty or broken storage', () => {
    expect(parseDeviceSaves(null)).toEqual([]);
    expect(parseDeviceSaves('{')).toEqual([]);
    expect(parseDeviceSaves('{"a":1}')).toEqual([]);
  });
});
