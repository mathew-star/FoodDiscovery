import { describe, expect, it } from 'vitest';
import { coarsen, deviceLocationMaxAgeMs, parseStoredLocation } from './device-location';

const now = 1_800_000_000_000;

describe('parseStoredLocation', () => {
  it('reads a fresh fix', () => {
    expect(parseStoredLocation(JSON.stringify({ lat: 17.4, lng: 78.4, at: now - 1_000 }), now)).toEqual({
      lat: 17.4,
      lng: 78.4,
    });
  });

  it('rejects stale, future, malformed and out-of-range values', () => {
    expect(
      parseStoredLocation(
        JSON.stringify({ lat: 17.4, lng: 78.4, at: now - deviceLocationMaxAgeMs - 1 }),
        now,
      ),
    ).toBeNull();
    expect(parseStoredLocation(JSON.stringify({ lat: 17.4, lng: 78.4, at: now + 60_000 }), now)).toBeNull();
    expect(parseStoredLocation(JSON.stringify({ lat: 95, lng: 78.4, at: now }), now)).toBeNull();
    expect(parseStoredLocation('{nope', now)).toBeNull();
    expect(parseStoredLocation(null, now)).toBeNull();
  });
});

it('coarsens to three decimals', () => {
  expect(coarsen({ lat: 17.385044, lng: 78.486671 })).toEqual({ lat: 17.385, lng: 78.487 });
});
