import { Fragment, createElement, type ReactNode } from 'react';
import en from './messages/en.json';

export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

type Messages = typeof en;

type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type MessageKey = Leaves<Messages>;
export type MessageVars = Record<string, string | number>;

const catalogs: Record<Locale, Messages> = { en };

function lookup(messages: Messages, key: MessageKey): string {
  let node: unknown = messages;
  for (const part of key.split('.')) {
    node = typeof node === 'object' && node !== null ? (node as Record<string, unknown>)[part] : undefined;
  }
  return typeof node === 'string' ? node : key;
}

export function t(key: MessageKey, vars?: MessageVars, locale: Locale = defaultLocale): string {
  const template = lookup(catalogs[locale], key);
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    return value === undefined ? match : String(value);
  });
}

/**
 * Like `t`, but `{name}` placeholders may be React nodes, so a sentence can carry styled parts
 * (a coloured verdict, a bold label) without being split into separately translated fragments.
 */
export function tRich(
  key: MessageKey,
  nodes: Record<string, ReactNode>,
  locale: Locale = defaultLocale,
): ReactNode[] {
  return lookup(catalogs[locale], key)
    .split(/(\{\w+\})/)
    .filter((part) => part.length > 0)
    .map((part, index) => {
      const name = /^\{(\w+)\}$/.exec(part)?.[1];
      const node = name !== undefined && name in nodes ? nodes[name] : part;
      return createElement(Fragment, { key: index }, node);
    });
}
