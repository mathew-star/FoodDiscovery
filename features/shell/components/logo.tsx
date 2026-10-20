import Link from 'next/link';
import { t } from '@/i18n';

export function Logo({ href }: { href: string }) {
  return (
    <Link href={href} aria-label={t('a11y.home')} className="inline-flex items-center gap-2 rounded-sm">
      <svg aria-hidden="true" viewBox="0 0 32 32" className="size-8">
        <rect width="32" height="32" rx="9" className="fill-primary" />
        <path
          d="M8 18.5c0-4.7 3.6-8.5 8-8.5s8 3.8 8 8.5H8Z M6.5 20.5h19a1.5 1.5 0 0 1 0 3h-19a1.5 1.5 0 0 1 0-3Z"
          className="fill-on-primary"
        />
      </svg>
      <span className="font-display text-xl font-semibold tracking-tight">{t('app.name')}</span>
    </Link>
  );
}
