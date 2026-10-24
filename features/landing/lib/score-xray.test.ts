import { describe, expect, it } from 'vitest';
import { demoWeight, maxTrustWeight } from './score-xray';

describe('demoWeight', () => {
  it('uses the trust weight for a fresh rating', () => {
    expect(demoWeight({ trust: 'T0', ageDays: 0 })).toBe(0.5);
    expect(demoWeight({ trust: 'FOUNDING', ageDays: 0 })).toBe(1.2);
    expect(maxTrustWeight).toBe(1.2);
  });

  it('halves every 270 days', () => {
    expect(demoWeight({ trust: 'T1', ageDays: 270 })).toBeCloseTo(0.5, 10);
  });

  it('counts disclosed and held ratings as zero', () => {
    expect(demoWeight({ trust: 'T1', ageDays: 0, disclosed: true })).toBe(0);
    expect(demoWeight({ trust: 'T1', ageDays: 0, held: true })).toBe(0);
  });
});
