import { Compass, MessagesSquare, Search, UserRound, type LucideIcon } from 'lucide-react';
import type { CitySlug } from '@/features/geo/schemas/city';
import type { MessageKey } from '@/i18n';

export type NavItem = {
  href: string;
  labelKey: MessageKey;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

/** Mobile bottom bar links (spec §3.1). The centre Post action is a button, not a link. */
export function primaryNavItems(city: CitySlug): { start: NavItem[]; end: NavItem[] } {
  return {
    start: [
      {
        href: `/${city}`,
        labelKey: 'nav.discover',
        icon: Compass,
        match: (pathname) => pathname === `/${city}` || pathname.startsWith(`/${city}/area`),
      },
      {
        href: `/${city}/search`,
        labelKey: 'nav.search',
        icon: Search,
        match: (pathname) => pathname.startsWith(`/${city}/search`),
      },
    ],
    end: [
      {
        href: '/communities',
        labelKey: 'nav.communities',
        icon: MessagesSquare,
        match: (pathname) => pathname.startsWith('/communities') || pathname.startsWith('/c/'),
      },
      {
        href: '/saved',
        labelKey: 'nav.you',
        icon: UserRound,
        match: (pathname) =>
          ['/saved', '/settings', '/notifications'].some((path) => pathname.startsWith(path)),
      },
    ],
  };
}
