import { ArrowDown, ArrowRight } from 'lucide-react';
import { defaultCity } from '@/features/geo/schemas/city';
import { t } from '@/i18n';
import { buttonVariants } from '@/shared/ui/button';
import { KotStack } from './kot-stack';
import { MagneticLink } from './magnetic-link.client';
import { Scribble } from './scribble.client';

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-[1240px] items-center gap-6 px-4 pt-10 pb-12 md:px-6 md:pt-16 lg:grid-cols-[1.25fr_1fr] lg:gap-10 lg:pb-20">
        <div className="flex flex-col gap-7">
          <p className="inline-flex w-fit rise-in items-center gap-2 border-2 border-ink bg-raised px-2.5 py-1 font-mono text-2xs tracking-widest uppercase">
            <span aria-hidden="true" className="size-2 rounded-full bg-haldi ring-2 ring-ink" />
            {t('landing.eyebrow')}
          </p>
          <h1
            id="hero-title"
            className="rise-in text-[clamp(3.6rem,13vw,8.5rem)] leading-[0.86] font-extrabold [font-stretch:72%] [--i:1]"
          >
            {t('landing.titleLead')}{' '}
            <span className="relative inline-block">
              <span className="highlight">{t('landing.titleKey')}</span>
              <Scribble className="-inset-x-[12%] -inset-y-[22%] h-[144%] w-[124%] text-rate-loved" />
            </span>{' '}
            {t('landing.titleTail')}
          </h1>
          <p className="max-w-xl rise-in text-lg text-ink-soft [--i:2] md:text-xl">{t('landing.subtitle')}</p>
          <div className="flex rise-in flex-wrap items-center gap-4 [--i:3]">
            <MagneticLink
              href={`/${defaultCity}`}
              className={buttonVariants({ variant: 'haldi', size: 'lg' })}
            >
              {t('landing.ctaPrimary')}
              <ArrowRight aria-hidden="true" />
            </MagneticLink>
            <a
              href="#how"
              className="inline-flex h-14 items-center gap-2 font-mono text-sm uppercase underline decoration-2 underline-offset-4"
            >
              {t('landing.ctaSecondary')}
              <ArrowDown aria-hidden="true" className="size-4" />
            </a>
          </div>
          <p className="font-mono text-2xs tracking-widest text-ink-soft uppercase">
            {t('landing.guestNote')}
          </p>
        </div>
        <KotStack />
      </div>
    </section>
  );
}
