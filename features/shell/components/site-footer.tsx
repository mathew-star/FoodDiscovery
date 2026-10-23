import Link from 'next/link';
import { t } from '@/i18n';
import { currentYear } from '@/shared/lib/time';
import { Stamp } from '@/shared/ui/stamp';

const links = [
  { href: '/about', labelKey: 'footer.about' },
  { href: '/guidelines', labelKey: 'footer.guidelines' },
] as const;

export async function SiteFooter() {
  const year = await currentYear();
  return (
    <footer className="mt-12 pb-24 lg:pb-10">
      <div className="mx-auto max-w-[1240px] px-4 md:px-6">
        <div className="mx-auto max-w-md bg-raised px-6 pt-8 pb-6 font-mono text-xs text-ink [mask:radial-gradient(circle_at_50%_0,transparent_5px,#000_5.5px)_0_0/16px_100%_repeat-x]">
          <p className="text-center font-bold tracking-[0.2em] uppercase">{t('footer.receiptTitle')}</p>
          <p className="mt-1 text-center text-ink-soft">{t('footer.printed')}</p>
          <hr aria-hidden="true" className="my-4 border-0 border-t-2 border-dashed border-rule-strong" />
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold">{t('footer.noPayToRank')}</p>
            <Stamp size="xs" tilt={8} className="shrink-0 text-rate-loved">
              {t('landing.trust.stampWord')}
            </Stamp>
          </div>
          <hr aria-hidden="true" className="my-4 border-0 border-t-2 border-dashed border-rule-strong" />
          <ul className="flex flex-col gap-2">
            {links.map((link) => (
              <li key={link.href} className="flex items-baseline gap-2">
                <Link
                  href={link.href}
                  className="underline decoration-rule-strong underline-offset-4 hover:decoration-ink"
                >
                  {t(link.labelKey)}
                </Link>
                <span aria-hidden="true" className="leader" />
                <span aria-hidden="true">→</span>
              </li>
            ))}
          </ul>
          <hr aria-hidden="true" className="my-4 border-0 border-t-2 border-dashed border-rule-strong" />
          <p className="text-center tracking-[0.2em] uppercase">{t('footer.thanks')}</p>
          <p className="mt-2 text-center text-ink-soft">{t('footer.copyright', { year })}</p>
        </div>
      </div>
    </footer>
  );
}
