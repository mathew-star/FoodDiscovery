import Link from 'next/link';
import { t } from '@/i18n';

/** FDN wordmark box (DESIGN-SYSTEM §7.12). */
export function Logo({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label={t('a11y.home')}
      className="border-2 border-ink bg-ink px-3 py-1 font-display text-2xl font-extrabold tracking-tighter text-cream shadow-brutal-sm"
    >
      {t('app.name')}
    </Link>
  );
}
