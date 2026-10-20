import { describe, expect, it } from 'vitest';
import { uuidv7 } from './uuid';

describe('uuidv7', () => {
  it('formats a version 7, variant 1 uuid', () => {
    expect(uuidv7()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('encodes the timestamp so ids sort by creation time', () => {
    const earlier = uuidv7(1_700_000_000_000);
    const later = uuidv7(1_700_000_000_001);
    expect(earlier < later).toBe(true);
    expect(earlier.replace(/-/g, '').slice(0, 12)).toBe((1_700_000_000_000).toString(16).padStart(12, '0'));
  });
});
