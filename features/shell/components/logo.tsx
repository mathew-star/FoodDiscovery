import Link from 'next/link';
import { t } from '@/i18n';
import { Stamp } from '@/shared/ui/stamp';

export function Logo({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label={t('a11y.home')}
      className="group inline-flex items-center gap-2 rounded-tick"
    >
      <Stamp
        size="md"
        tilt={-6}
        className="text-ink transition-transform duration-(--dur-ui) ease-snap group-hover:rotate-0"
      >
        {t('app.name')}
      </Stamp>
      <span
        aria-hidden="true"
        className="hidden font-mono text-2xs leading-tight tracking-wide text-ink-soft uppercase sm:block"
      >
        Food
        <br />
        Discovery
      </span>
    </Link>
  );
}
