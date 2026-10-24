import { useSyncExternalStore } from 'react';
import { vegOnlyClass, vegOnlyStorageKey } from '../lib/veg-only';

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function read(): boolean {
  return document.documentElement.classList.contains(vegOnlyClass);
}

export function useVegOnly(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}

export function setVegOnly(on: boolean): void {
  document.documentElement.classList.toggle(vegOnlyClass, on);
  try {
    if (on) localStorage.setItem(vegOnlyStorageKey, '1');
    else localStorage.removeItem(vegOnlyStorageKey);
  } catch {
    // Storage can be unavailable (private mode); the toggle still works for this visit.
  }
  listeners.forEach((listener) => listener());
}
