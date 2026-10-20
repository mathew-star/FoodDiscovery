import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8');

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`Missing selector ${selector}`);
  const end = css.indexOf('}', start);
  const tokens: Record<string, string> = {};
  for (const match of css.slice(start, end).matchAll(/--([\w-]+):\s*(#[0-9a-f]{6});/gi)) {
    const [, name, value] = match;
    if (name && value) tokens[name] = value.toLowerCase();
  }
  return tokens;
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((index) => {
    const value = Number.parseInt(hex.slice(index, index + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const [r = 0, g = 0, b = 0] = channels;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((high ?? 0) + 0.05) / ((low ?? 0) + 0.05);
}

const textTokens = [
  'text',
  'text-muted',
  'primary',
  'accent',
  'danger',
  'diet-veg',
  'diet-nonveg',
  'diet-egg',
  'rate-loved',
  'rate-good',
  'rate-okay',
  'rate-skip',
];
const backgrounds = ['bg', 'surface', 'surface-2'];

const themes = {
  light: block(':root'),
  dark: block(":root[data-theme='dark']"),
};

describe.each(Object.entries(themes))('%s theme', (_, tokens) => {
  const get = (name: string): string => {
    const value = tokens[name];
    if (!value) throw new Error(`Missing token --${name}`);
    return value;
  };

  it.each(textTokens.flatMap((fg) => backgrounds.map((bg) => [fg, bg] as const)))(
    '%s on %s meets 4.5:1',
    (fg, bg) => {
      expect(contrast(get(fg), get(bg))).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('on-primary text meets 4.5:1 on primary', () => {
    expect(contrast(get('on-primary'), get('primary'))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(backgrounds)('border-strong meets 3:1 on %s', (bg) => {
    expect(contrast(get('border-strong'), get(bg))).toBeGreaterThanOrEqual(3);
  });
});

it('system dark and explicit dark themes define identical colours', () => {
  expect(block(":root:not([data-theme='light'])")).toEqual(themes.dark);
});
