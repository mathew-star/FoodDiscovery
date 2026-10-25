import { describe, expect, it } from 'vitest';
import { safeNextPath } from './safe-next';

describe('safeNextPath', () => {
  it('keeps same-site paths with query and hash', () => {
    expect(safeNextPath('/r/deccan-degh-house-old-city?tab=menu#rate')).toBe(
      '/r/deccan-degh-house-old-city?tab=menu#rate',
    );
  });

  it.each([
    null,
    '',
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    'javascript:alert(1)',
    '/a\nb',
    '/login?next=/x',
    '/api/auth/sign-out',
  ])('falls back for %s', (raw) => {
    expect(safeNextPath(raw)).toBe('/hyderabad');
  });
});
