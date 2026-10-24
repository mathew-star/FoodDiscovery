import Link from 'next/link';
import { DietToggle } from '@/features/dishes/components/diet-toggle.client';
import type { CitySlug } from '@/features/geo/schemas/city';
import { SearchBox } from '@/features/search/components/search-box';
import { t } from '@/i18n';
import { CityPill } from './city-pill.client';
import { Logo } from './logo';
import { NavPills, navPillClass } from './nav-pills';
import { PostButton } from './post-button.client';

/** App header (spec §3.1, DESIGN-SYSTEM §7.12). */
export function TopBar({ city }: { city: CitySlug }) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-cream/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1360px] items-center gap-3 px-5 md:px-10">
        <Logo href={`/${city}`} />
        <CityPill city={city} className="hidden sm:flex" />
        <SearchBox city={city} className="mx-4 hidden max-w-md flex-1 lg:block" />
        <NavPills aria-label={t('a11y.siteNav')} className="ml-auto hidden lg:flex">
          <Link href="/communities" className={navPillClass()}>
            {t('nav.communities')}
          </Link>
          <Link href="/battles" className={navPillClass()}>
            {t('nav.battles')}
          </Link>
        </NavPills>
        <div className="ml-auto flex items-center gap-2.5 lg:ml-0">
          <DietToggle />
          <span className="hidden lg:inline-flex">
            <PostButton variant="header" />
          </span>
        </div>
      </div>
    </header>
  );
}
