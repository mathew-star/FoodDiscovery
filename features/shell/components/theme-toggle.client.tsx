'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { t } from '@/i18n';
import { themeCookie, themes, type Theme } from '@/shared/config/site';
import { IconButton } from '@/shared/ui/button';

type Preference = Theme | 'system';

const order: readonly Preference[] = ['system', 'light', 'dark'];
const listeners = new Set<() => void>();

function readPreference(): Preference {
  const value = document.documentElement.dataset.theme;
  return themes.find((theme) => theme === value) ?? 'system';
}

function writePreference(next: Preference): void {
  const root = document.documentElement;
  if (next === 'system') {
    delete root.dataset.theme;
    document.cookie = `${themeCookie}=; Path=/; Max-Age=0; SameSite=Lax`;
  } else {
    root.dataset.theme = next;
    document.cookie = `${themeCookie}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const icons = { system: Monitor, light: Sun, dark: Moon } as const;
const labels = { system: 'theme.system', light: 'theme.light', dark: 'theme.dark' } as const;

export function ThemeToggle() {
  const preference = useSyncExternalStore(subscribe, readPreference, () => 'system' as const);
  const Icon = icons[preference];
  const next = order[(order.indexOf(preference) + 1) % order.length] ?? 'system';

  return (
    <IconButton label={`${t('theme.label')}: ${t(labels[preference])}`} onClick={() => writePreference(next)}>
      <Icon aria-hidden="true" />
    </IconButton>
  );
}
