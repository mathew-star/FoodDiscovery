import Link from 'next/link';
import { defaultCity } from '@/features/geo/schemas/city';
import { Logo } from '@/features/shell/components/logo';
import { ThemeToggle } from '@/features/shell/components/theme-toggle.client';
import { t } from '@/i18n';
import { buttonVariants } from '@/shared/ui/button';

const anchors = [
  { href: '#how', labelKey: 'landing.nav.how' },
  { href: '#features', labelKey: 'landing.nav.features' },
  { href: '#trust', labelKey: 'landing.nav.trust' },
] as const;

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4 md:px-6">
        <Logo href="/" />
        <nav aria-label={t('a11y.primaryNav')} className="ml-6 hidden gap-1 md:flex">
          {anchors.map((anchor) => (
            <a
              key={anchor.href}
              href={anchor.href}
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              {t(anchor.labelKey)}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <Link href={`/${defaultCity}`} className={buttonVariants({ size: 'sm' })}>
            {t('landing.ctaPrimary')}
          </Link>
        </div>
      </div>
    </header>
  );
}
