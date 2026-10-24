import Link from 'next/link';
import { DietToggle } from '@/features/dishes/components/diet-toggle.client';
import { defaultCity } from '@/features/geo/schemas/city';
import { CityPill } from '@/features/shell/components/city-pill.client';
import { Logo } from '@/features/shell/components/logo';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { buttonVariants } from '@/shared/ui/button';
import { SectionNav } from './section-nav.client';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-cream/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1360px] items-center justify-between gap-4 px-5 md:px-10">
        <div className="flex items-center gap-3">
          <Logo href="/" />
          <CityPill city={defaultCity} className="hidden sm:flex" />
        </div>
        <SectionNav />
        <div className="flex items-center gap-2.5">
          <DietToggle />
          <Link
            href={`/${defaultCity}`}
            className={cn(buttonVariants({ size: 'sm' }), 'hidden sm:inline-flex')}
          >
            {t('landing.explore')}
          </Link>
        </div>
      </div>
    </header>
  );
}
