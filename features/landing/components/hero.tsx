import Link from 'next/link';
import { defaultCity } from '@/features/geo/schemas/city';
import { t } from '@/i18n';
import { buttonVariants } from '@/shared/ui/button';
import { HeroDemo } from './hero-demo.client';
import { LiveBattle } from './live-battle.client';

/** Section 1: a live demo, not a promise. */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative border-b-4 border-ink pt-8 pb-14 md:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1360px] px-5 md:px-10">
        <ul
          aria-label={t('landing.promises.label')}
          className="mb-7 inline-flex flex-wrap items-center gap-x-4 gap-y-1 border-[1.5px] border-ink bg-paper px-3.5 py-1.5 text-xs shadow-brutal-sm"
        >
          <li className="text-terracottaDeep">{t('landing.promises.noStars')}</li>
          <li>{t('landing.promises.noSignup')}</li>
          <li className="hidden sm:list-item">{t('landing.promises.noPay')}</li>
        </ul>

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <HeroDemo
            title={
              <h1 id="hero-title" className="type-display-xl">
                {t('landing.hero.titleLine1')} <br className="hidden sm:inline" />
                {t('landing.hero.titleLine2')}{' '}
                <span className="font-semibold underline decoration-terracotta decoration-4 underline-offset-8">
                  {t('landing.hero.titleEmphasis')}
                </span>
              </h1>
            }
            footer={
              <div className="grid items-end gap-6 border-t-2 border-ink/15 pt-5 sm:grid-cols-12">
                <p className="text-base leading-relaxed text-inkMuted sm:col-span-7">
                  {t('landing.hero.body')}
                </p>
                <div className="flex flex-wrap items-center gap-4 sm:col-span-5 sm:justify-end">
                  <Link href={`/${defaultCity}`} className={buttonVariants({ variant: 'secondary' })}>
                    {t('landing.explore')}
                  </Link>
                  <a href="#six-apps" className={buttonVariants({ variant: 'link' })}>
                    {t('landing.hero.why')}
                  </a>
                </div>
              </div>
            }
            aside={<LiveBattle />}
          />
        </div>
      </div>
    </section>
  );
}
