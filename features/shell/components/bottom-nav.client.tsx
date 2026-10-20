'use client';

import { m } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { defaultCity } from '@/features/geo/schemas/city';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { primaryNavItems } from './nav-items';

const noopSubscribe = () => () => undefined;

function ActiveBottomNav() {
  return <BottomNavView pathname={usePathname()} />;
}

export function BottomNav() {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  return hydrated ? <ActiveBottomNav /> : <BottomNavView pathname={null} />;
}

export function BottomNavView({ pathname }: { pathname: string | null }) {
  const items = primaryNavItems(defaultCity);

  return (
    <nav
      aria-label={t('a11y.primaryNav')}
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map(({ href, labelKey, icon: Icon, match }, index) => {
          const active = pathname !== null && match(pathname);
          const isPost = index === 2;
          return (
            <li key={href} className="relative">
              {active ? (
                <m.span
                  layoutId="bottom-nav-active"
                  className="absolute inset-x-3 top-0 h-1 bg-ink"
                  transition={{ type: 'spring', stiffness: 520, damping: 38 }}
                />
              ) : null}
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-16 flex-col items-center justify-center gap-0.5 font-mono text-2xs tracking-wide uppercase',
                  active ? 'font-bold text-ink' : 'text-ink-soft hover:text-ink',
                )}
              >
                {isPost ? (
                  <span className="-mt-5 flex size-12 press items-center justify-center rounded-full border-2 border-ink bg-haldi text-on-haldi shadow-lift-sm">
                    <Icon aria-hidden="true" className="size-6" strokeWidth={2.5} />
                  </span>
                ) : (
                  <Icon aria-hidden="true" className="size-6" strokeWidth={active ? 2.4 : 1.8} />
                )}
                {t(labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
