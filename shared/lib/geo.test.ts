import { describe, expect, it } from 'vitest';
import { distanceMeters, googleMapsDirectionsUrl, parseEwkbPoint } from './geo';

describe('parseEwkbPoint', () => {
  it('reads an SRID-tagged little-endian point', () => {
    expect(parseEwkbPoint('0101000020E6100000A4703D0AD7A35140B81E85EB51383140')).toEqual({
      lng: 70.56,
      lat: 17.22,
    });
  });

  it('rejects non-point geometries', () => {
    expect(() => parseEwkbPoint('0102000020E6100000')).toThrow('Expected a WKB point');
  });
});

describe('distanceMeters', () => {
  it('measures Charminar to Hussain Sagar within 1%', () => {
    const meters = distanceMeters({ lat: 17.3616, lng: 78.4747 }, { lat: 17.4239, lng: 78.4738 });
    expect(meters).toBeGreaterThan(6_860);
    expect(meters).toBeLessThan(7_000);
  });
});

it('builds the spec Google Maps directions URL', () => {
  expect(googleMapsDirectionsUrl({ lat: 17.36, lng: 78.47 })).toBe(
    'https://www.google.com/maps/dir/?api=1&destination=17.36,78.47',
  );
});
