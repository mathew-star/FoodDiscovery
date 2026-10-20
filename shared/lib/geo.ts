export type LatLng = { lat: number; lng: number };

const EARTH_RADIUS_M = 6_371_008.8;

export function distanceMeters(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function parseEwkbPoint(hex: string): LatLng {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  const view = new DataView(bytes.buffer);
  const littleEndian = view.getUint8(0) === 1;
  const type = view.getUint32(1, littleEndian);
  const hasSrid = (type & 0x20000000) !== 0;
  if ((type & 0xff) !== 1) throw new Error('Expected a WKB point');
  const offset = hasSrid ? 9 : 5;
  return { lng: view.getFloat64(offset, littleEndian), lat: view.getFloat64(offset + 8, littleEndian) };
}

export function googleMapsDirectionsUrl({ lat, lng }: LatLng): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
