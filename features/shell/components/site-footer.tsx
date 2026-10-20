import Link from 'next/link';
import { t } from '@/i18n';
import { currentYear } from '@/shared/lib/time';

const links = [
  { href: '/about', labelKey: 'footer.about' },
  { href: '/guidelines', labelKey: 'footer.guidelines' },
] as const;

export async function SiteFooter() {
  const year = await currentYear();
  return (
    <footer className="border-t border-border bg-surface-2 pb-24 lg:pb-0">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-8 text-sm md:px-6">
        <p className="font-medium">{t('footer.noPayToRank')}</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-muted underline-offset-4 hover:text-text hover:underline"
              >
                {t(link.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-muted">{t('footer.copyright', { year })}</p>
      </div>
    </footer>
  );
}
