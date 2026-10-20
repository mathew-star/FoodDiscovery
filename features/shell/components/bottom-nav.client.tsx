'use client';

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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map(({ href, labelKey, icon: Icon, match }) => {
          const active = pathname !== null && match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-(--dur-fast)',
                  active ? 'text-primary' : 'text-muted hover:text-text',
                )}
              >
                <Icon aria-hidden="true" className="size-6" strokeWidth={active ? 2.25 : 1.75} />
                {t(labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
