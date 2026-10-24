import { describe, expect, it } from 'vitest';
import en from './messages/en.json';
import { createElement, isValidElement, type ReactElement } from 'react';
import { t, tRich } from './index';

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
    expect(t('footer.copyright')).toBe('© {year} Food Discovery Network. Made in Hyderabad.');
  });

  it('has no empty messages', () => {
    expect(leafValues(en).every((value) => value.trim().length > 0)).toBe(true);
  });
});

describe('tRich', () => {
  const children = (parts: ReturnType<typeof tRich>) =>
    parts.map((part) =>
      isValidElement(part) ? (part as ReactElement<{ children: unknown }>).props.children : part,
    );

  it('replaces placeholders with nodes and keeps the surrounding text', () => {
    const city = createElement('b', null, 'Hyderabad');
    expect(children(tRich('city.current', { city }))).toEqual(['Current city: ', city]);
  });

  it('keeps placeholders without a node as text', () => {
    expect(children(tRich('footer.copyright', {})).join('')).toBe(t('footer.copyright'));
  });
});

function hasArray(node: unknown): boolean {
  if (Array.isArray(node)) return true;
  if (typeof node === 'object' && node !== null) return Object.values(node).some(hasArray);
  return false;
}

it('uses objects, not arrays, so every message has a typed key', () => {
  expect(hasArray(en)).toBe(false);
});
