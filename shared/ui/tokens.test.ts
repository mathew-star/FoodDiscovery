import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

function rootTokens(): Record<string, string> {
  const css = read('app/globals.css');
  const start = css.indexOf(':root {');
  const block = css.slice(start, css.indexOf('}', start));
  const tokens: Record<string, string> = {};
  for (const [, name, value] of block.matchAll(/--fdn-([\w-]+):\s*(#[0-9a-f]{6});/gi)) {
    if (name && value) tokens[name] = value.toLowerCase();
  }
  return tokens;
}

function luminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((index) => {
    const value = Number.parseInt(hex.slice(index, index + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [high = 0, low = 0] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

const tokens = rootTokens();
const get = (name: string): string => {
  const value = tokens[name];
  if (!value) throw new Error(`Missing token --fdn-${name}`);
  return value;
};

it('matches the fixed palette in DESIGN-SYSTEM §3.1', () => {
  expect(tokens).toEqual({
    cream: '#ecebc9',
    'cream-dark': '#e2e0b5',
    paper: '#f8f7e8',
    ink: '#141612',
    'ink-muted': '#4a4d43',
    lime: '#c7ea76',
    'lime-bright': '#b8e94a',
    olive: '#76a02b',
    'olive-deep': '#4f6e17',
    'olive-btn': '#97ae42',
    terracotta: '#c8524b',
    'terracotta-deep': '#a9443d',
    saffron: '#f2b33d',
  });
});

/* Every text/surface pair the components use (§3.3, §3.4). */
const textPairs: [text: string, surface: string][] = [
  ['ink', 'cream'],
  ['ink', 'cream-dark'],
  ['ink', 'paper'],
  ['ink', 'lime'],
  ['ink', 'lime-bright'],
  ['ink', 'olive'],
  ['ink', 'olive-btn'],
  ['ink', 'saffron'],
  ['ink-muted', 'cream'],
  ['ink-muted', 'cream-dark'],
  ['ink-muted', 'paper'],
  ['ink-muted', 'lime'],
  ['olive-deep', 'cream'],
  ['olive-deep', 'paper'],
  ['terracotta-deep', 'cream'],
  ['terracotta-deep', 'paper'],
  ['paper', 'terracotta-deep'],
  ['paper', 'ink'],
  ['cream', 'ink'],
  ['lime', 'ink'],
  ['saffron', 'ink'],
];

describe('text contrast meets WCAG AA (4.5:1)', () => {
  it.each(textPairs)('%s on %s', (text, surface) => {
    expect(contrast(get(text), get(surface))).toBeGreaterThanOrEqual(4.5);
  });
});

describe('graphics contrast meets 3:1', () => {
  it.each(['cream', 'paper'])('terracotta focus ring on %s', (surface) => {
    expect(contrast(get('terracotta'), get(surface))).toBeGreaterThanOrEqual(3);
  });
});

it('paper text fails on olive and terracotta, so olive fills carry ink text and terracotta text uses terracotta-deep', () => {
  expect(contrast(get('paper'), get('olive'))).toBeLessThan(4.5);
  expect(contrast(get('paper'), get('terracotta'))).toBeLessThan(4.5);
});

it('OG image palette mirrors the CSS tokens', () => {
  const source = read('shared/ui/og-card.tsx');
  const block = source.slice(
    source.indexOf('ogPalette = {'),
    source.indexOf('};', source.indexOf('ogPalette = {')),
  );
  const og = Object.fromEntries(
    [...block.matchAll(/(\w+): '(#[0-9a-f]{6})'/gi)].map(([, name = '', value = '']) => [name, value]),
  );
  expect(og).toEqual({
    cream: get('cream'),
    paper: get('paper'),
    ink: get('ink'),
    inkMuted: get('ink-muted'),
    lime: get('lime'),
    olive: get('olive'),
  });
});
