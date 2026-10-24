import { defaultCity } from '@/features/geo/schemas/city';
import { CommandBar } from '@/features/search/components/command-bar.client';
import { t } from '@/i18n';
import { InstallButton } from './install-button.client';

/** Closing CTA: one more chance to search before the footer. */
export function ClosingCta() {
  return (
    <section aria-labelledby="cta-title" className="border-b-4 border-ink bg-lime py-14 md:py-20">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-center gap-8 px-5 md:px-10 lg:grid-cols-12">
        <h2 id="cta-title" className="type-display-l lg:col-span-6">
          {t('landing.cta.title')}
        </h2>
        <div className="space-y-4 lg:col-span-6">
          <CommandBar
            action={`/${defaultCity}/search`}
            id="cta-search"
            label={t('landing.cta.searchLabel')}
            placeholder={t('landing.cta.placeholder')}
            showIcon={false}
          />
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <InstallButton />
            <span>{t('landing.cta.noStore')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
