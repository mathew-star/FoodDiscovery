import Link from 'next/link';
import { defaultCity } from '@/features/geo/schemas/city';
import { Logo } from '@/features/shell/components/logo';
import { ThemeToggle } from '@/features/shell/components/theme-toggle.client';
import { t } from '@/i18n';
import { buttonVariants } from '@/shared/ui/button';

const anchors = [
  { href: '#how', labelKey: 'landing.nav.how' },
  { href: '#menu', labelKey: 'landing.nav.menu' },
  { href: '#rules', labelKey: 'landing.nav.rules' },
] as const;

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-4 md:px-6">
        <Logo href="/" />
        <nav aria-label={t('a11y.primaryNav')} className="ml-6 hidden gap-1 md:flex">
          {anchors.map((anchor) => (
            <a
              key={anchor.href}
              href={anchor.href}
              className="inline-flex h-10 items-center px-3 font-mono text-xs font-medium tracking-wide uppercase decoration-2 underline-offset-[6px] hover:underline"
            >
              {t(anchor.labelKey)}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link href={`/${defaultCity}`} className={buttonVariants({ variant: 'primary', size: 'sm' })}>
            {t('landing.ctaPrimary')}
          </Link>
        </div>
      </div>
    </header>
  );
}
