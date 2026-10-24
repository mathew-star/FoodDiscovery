import Link from 'next/link';
import type { ReactNode } from 'react';
import { cityNameKey, defaultCity } from '@/features/geo/schemas/city';
import { t, type MessageKey } from '@/i18n';
import { currentYear } from '@/shared/lib/time';

type FooterLink = { labelKey: MessageKey; href?: string };

/* Routes that ship in later phases render as "soon" instead of linking to a 404. */
const communityLinks: FooterLink[] = [
  { labelKey: 'footer.communities' },
  { labelKey: 'footer.battles' },
  { labelKey: 'footer.guidelines', href: '/guidelines' },
  { labelKey: 'footer.howScoresWork', href: '/guidelines#scores' },
  { labelKey: 'footer.disclosureRules', href: '/guidelines#disclose' },
];

const companyLinks: FooterLink[] = [
  { labelKey: 'footer.about', href: '/about' },
  { labelKey: 'footer.privacy' },
  { labelKey: 'footer.terms' },
  { labelKey: 'footer.grievances' },
];

/*
  Static so the footer renders without a database (the landing page is static and the catalogue
  can be empty). Slugs match the launch catalogue; names are proper nouns, not translated copy.
*/
const areas = [
  { slug: 'old-city', name: 'Old City' },
  { slug: 'banjara-hills', name: 'Banjara Hills' },
  { slug: 'madhapur', name: 'Madhapur' },
  { slug: 'tolichowki', name: 'Tolichowki' },
  { slug: 'abids', name: 'Abids' },
];

const bestDishes = [
  { slug: 'mutton-dum-biryani', name: 'Mutton Dum Biryani' },
  { slug: 'mutton-haleem', name: 'Mutton Haleem' },
  { slug: 'irani-chai', name: 'Irani Chai' },
  { slug: 'mutton-mandi', name: 'Mutton Mandi' },
  { slug: 'pesarattu', name: 'Pesarattu' },
  { slug: 'double-ka-meetha', name: 'Double ka Meetha' },
];

const languages: { labelKey: MessageKey; active: boolean }[] = [
  { labelKey: 'footer.english', active: true },
  { labelKey: 'footer.telugu', active: false },
  { labelKey: 'footer.hindi', active: false },
];

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 font-sans text-xs text-lime">{title}</h3>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function Item({ label, href }: { label: string; href?: string }) {
  return (
    <li>
      {href ? (
        <Link href={href} className="hover:text-lime">
          {label}
        </Link>
      ) : (
        <span className="text-cream/60">
          {label} <span className="text-[10px]">{t('footer.soon')}</span>
        </span>
      )}
    </li>
  );
}

/** Ink footer (DESIGN-SYSTEM §7.15). */
export async function SiteFooter() {
  const year = await currentYear();

  return (
    <footer aria-labelledby="footer-title" className="overflow-hidden bg-ink pt-16 text-cream md:pt-20">
      <h2 id="footer-title" className="sr-only">
        {t('footer.title')}
      </h2>
      <div className="mx-auto grid max-w-[1360px] gap-12 px-5 md:px-10 lg:grid-cols-12">
        <div className="max-w-sm space-y-4 lg:col-span-4">
          <p className="font-display text-3xl font-extrabold tracking-tight">{t('app.name')}</p>
          <p className="leading-relaxed text-cream/70">{t('footer.promise')}</p>
          <p className="text-xs text-lime">{t('footer.noAds')}</p>
        </div>

        <nav
          aria-label={t('footer.nav')}
          className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-4 lg:col-span-8"
        >
          <Column title={t('footer.eatByArea')}>
            {areas.map((area) => (
              <Item key={area.slug} label={area.name} href={`/${defaultCity}/area/${area.slug}`} />
            ))}
          </Column>
          <Column title={t('footer.bestInCity', { city: t(cityNameKey[defaultCity]) })}>
            {bestDishes.map((dish) => (
              <Item key={dish.slug} label={dish.name} href={`/${defaultCity}/dish/${dish.slug}`} />
            ))}
          </Column>
          <Column title={t('footer.community')}>
            {communityLinks.map((link) => (
              <Item key={link.labelKey} label={t(link.labelKey)} href={link.href} />
            ))}
          </Column>
          <Column title={t('app.name')}>
            {companyLinks.map((link) => (
              <Item key={link.labelKey} label={t(link.labelKey)} href={link.href} />
            ))}
          </Column>

          <div className="col-span-2 flex border-t border-cream/15 pt-8 sm:col-span-4 sm:justify-end">
            <div
              role="group"
              aria-label={t('footer.language')}
              className="inline-flex w-fit gap-1 rounded-full border-[1.5px] border-cream/30 p-1 text-xs"
            >
              {languages.map(({ labelKey, active }) => (
                <button
                  key={labelKey}
                  type="button"
                  aria-pressed={active}
                  disabled={!active}
                  title={active ? undefined : t('footer.soon')}
                  className={
                    active
                      ? 'rounded-full bg-lime px-3 py-1.5 text-ink'
                      : 'rounded-full px-3 py-1.5 text-cream/60 disabled:cursor-not-allowed'
                  }
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>

      <p
        aria-hidden="true"
        className="mt-16 translate-y-[8%] text-center font-display text-[34vw] leading-[0.78] font-extrabold tracking-tighter wordmark-outline select-none lg:text-[26vw]"
      >
        {t('app.name')}
      </p>
      <div className="border-t border-cream/15">
        <div className="mx-auto flex max-w-[1360px] flex-col justify-between gap-2 px-5 py-5 text-xs text-cream/60 sm:flex-row md:px-10">
          <span>{t('footer.copyright', { year })}</span>
          <span>{t('footer.noAds')}</span>
        </div>
      </div>
    </footer>
  );
}
