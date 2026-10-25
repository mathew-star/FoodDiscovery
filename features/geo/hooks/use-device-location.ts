import { useSyncExternalStore } from 'react';
import type { LatLng } from '@/shared/lib/geo';
import { coarsen, deviceLocationStorageKey, parseStoredLocation } from '../lib/device-location';

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedValue: LatLng | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function read(): LatLng | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(deviceLocationStorageKey);
  } catch {
    return cachedValue;
  }
  // useSyncExternalStore needs a stable snapshot for unchanged storage.
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parseStoredLocation(raw, Date.now());
  }
  return cachedValue;
}

/** The guest's last shared position, kept on this device only; distances are computed in the browser. */
export function useDeviceLocation(): LatLng | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export type LocationOutcome = 'granted' | 'denied' | 'dismissed' | 'unavailable';

export function requestDeviceLocation(): Promise<LocationOutcome> {
  if (!('geolocation' in navigator)) return Promise.resolve('unavailable');
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = coarsen({ lat: position.coords.latitude, lng: position.coords.longitude });
        try {
          localStorage.setItem(deviceLocationStorageKey, JSON.stringify({ ...point, at: Date.now() }));
        } catch {
          // Without storage the fix lasts for this page only.
          cachedRaw = null;
          cachedValue = point;
        }
        listeners.forEach((listener) => listener());
        resolve('granted');
      },
      (error) => resolve(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000, timeout: 10_000 },
    );
  });
}

export function forgetDeviceLocation(): void {
  try {
    localStorage.removeItem(deviceLocationStorageKey);
  } catch {
    // Nothing stored.
  }
  cachedRaw = null;
  cachedValue = null;
  listeners.forEach((listener) => listener());
}
