'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { defaultCity } from '@/features/geo/schemas/city';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { primaryNavItems, type NavItem } from './nav-items';
import { PostButton } from './post-button.client';

const noopSubscribe = () => () => undefined;

function ActiveBottomNav() {
  return <BottomNavView pathname={usePathname()} />;
}

/** Active state is read after hydration so the static shell never waits on the pathname (D15). */
export function BottomNav() {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  return hydrated ? <ActiveBottomNav /> : <BottomNavView pathname={null} />;
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string | null }) {
  const active = pathname !== null && item.match(pathname);
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex flex-col items-center gap-1 py-2.5 text-[10px]',
          active ? 'text-ink' : 'text-inkMuted hover:text-ink',
        )}
      >
        <Icon aria-hidden="true" className="size-5" strokeWidth={2.3} />
        {t(item.labelKey)}
      </Link>
    </li>
  );
}

export function BottomNavView({ pathname }: { pathname: string | null }) {
  const { start, end } = primaryNavItems(defaultCity);
  return (
    <nav
      aria-label={t('a11y.primaryNav')}
      className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-ink bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 items-end">
        {start.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
        <li className="flex justify-center pb-2">
          <PostButton variant="bottom-nav" />
        </li>
        {end.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </ul>
    </nav>
  );
}
