import Link from 'next/link';
import { Plus } from 'lucide-react';
import type { CitySlug } from '@/features/geo/schemas/city';
import { SearchBox } from '@/features/search/components/search-box';
import { t } from '@/i18n';
import { buttonVariants } from '@/shared/ui/button';
import { CitySwitcher } from './city-switcher';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle.client';

const navLink =
  'inline-flex h-10 items-center px-3 font-mono text-xs font-medium tracking-wide uppercase underline-offset-[6px] decoration-2 hover:underline';

export function TopBar({ city }: { city: CitySlug }) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-3 px-4 md:px-6">
        <Logo href={`/${city}`} />
        <CitySwitcher city={city} />
        <SearchBox city={city} className="mx-6 hidden max-w-md flex-1 lg:block" />
        <nav aria-label={t('a11y.primaryNav')} className="ml-auto hidden items-center gap-1 lg:flex">
          <Link href="/communities" className={navLink}>
            {t('nav.communities')}
          </Link>
          <Link href="/battles" className={navLink}>
            {t('nav.battles')}
          </Link>
          <Link href="/post/new" className={buttonVariants({ variant: 'haldi', size: 'sm' })}>
            <Plus aria-hidden="true" />
            {t('nav.post')}
          </Link>
        </nav>
        <div className="ml-auto lg:ml-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
