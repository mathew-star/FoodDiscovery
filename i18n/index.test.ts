import { describe, expect, it } from 'vitest';
import en from './messages/en.json';
import { t } from './index';

function leafValues(node: unknown): string[] {
  if (typeof node === 'string') return [node];
  if (typeof node === 'object' && node !== null) return Object.values(node).flatMap(leafValues);
  return [];
}

describe('t', () => {
  it('resolves nested keys', () => {
    expect(t('nav.discover')).toBe('Discover');
  });

  it('interpolates variables', () => {
    expect(t('city.current', { city: 'Hyderabad' })).toBe('Current city: Hyderabad');
  });

  it('leaves unknown variables intact', () => {
    expect(t('footer.copyright')).toBe('© {year} FDN');
  });

  it('has no empty messages', () => {
    expect(leafValues(en).every((value) => value.trim().length > 0)).toBe(true);
  });
});
