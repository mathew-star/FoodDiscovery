import { Compass, MessagesSquare, Plus, Search, UserRound, type LucideIcon } from 'lucide-react';
import type { CitySlug } from '@/features/geo/schemas/city';
import type { MessageKey } from '@/i18n';

export type NavItem = {
  href: string;
  labelKey: MessageKey;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

export function primaryNavItems(city: CitySlug): NavItem[] {
  return [
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
    {
      href: '/post/new',
      labelKey: 'nav.post',
      icon: Plus,
      match: (pathname) => pathname.startsWith('/post'),
    },
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
  ];
}
