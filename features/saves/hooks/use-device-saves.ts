import { useSyncExternalStore } from 'react';
import {
  deviceSavesStorageKey,
  parseDeviceSaves,
  toggleDeviceSave,
  type DeviceSave,
} from '../lib/device-saves';

const listeners = new Set<() => void>();
const emptySaves: DeviceSave[] = [];
let snapshotRaw: string | null = null;
let snapshot: DeviceSave[] = emptySaves;
// Used when storage is unavailable (private mode): saves last for this page only.
let memoryOnly: DeviceSave[] | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function read(): DeviceSave[] {
  if (memoryOnly) return memoryOnly;
  let raw: string | null;
  try {
    raw = localStorage.getItem(deviceSavesStorageKey);
  } catch {
    return snapshot;
  }
  if (raw !== snapshotRaw) {
    snapshotRaw = raw;
    snapshot = parseDeviceSaves(raw);
  }
  return snapshot;
}

export function useDeviceSaves(): DeviceSave[] {
  return useSyncExternalStore(subscribe, read, () => emptySaves);
}

export function toggleSave(item: DeviceSave) {
  const result = toggleDeviceSave(read(), item);
  if (result.outcome !== 'full') {
    try {
      localStorage.setItem(deviceSavesStorageKey, JSON.stringify(result.saves));
    } catch {
      memoryOnly = result.saves;
    }
    listeners.forEach((listener) => listener());
  }
  return result.outcome;
}

/** After a member's device saves are imported into their account (spec E1-4). */
export function clearDeviceSaves() {
  try {
    localStorage.removeItem(deviceSavesStorageKey);
  } catch {
    // Nothing stored.
  }
  memoryOnly = null;
  snapshotRaw = null;
  snapshot = emptySaves;
  listeners.forEach((listener) => listener());
}

export function readDeviceSaves(): DeviceSave[] {
  return read();
}
