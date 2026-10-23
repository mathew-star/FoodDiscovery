import { ArrowRight } from 'lucide-react';
import { defaultCity } from '@/features/geo/schemas/city';
import { t } from '@/i18n';
import { buttonVariants } from '@/shared/ui/button';
import { MagneticLink } from './magnetic-link.client';
import { Reveal } from './reveal';

export function FinalTicket() {
  return (
    <section aria-labelledby="final-title">
      <div className="mx-auto max-w-[1240px] px-4 py-16 md:px-6 md:py-24">
        <Reveal className="drop-shadow-[6px_6px_0_var(--lift-color)]">
          <div className="grid border-2 border-ink bg-haldi text-on-haldi notch-x md:grid-cols-[1fr_auto] md:[--notch-y:50%]">
            <div className="flex flex-col gap-4 p-8 md:p-12">
              <h2 id="final-title" className="text-7xl font-extrabold md:text-8xl">
                {t('landing.final.title')}
              </h2>
              <p className="max-w-lg text-lg">{t('landing.final.body')}</p>
            </div>
            <div className="flex flex-col items-start justify-center gap-4 border-t-2 border-dashed border-ink p-8 md:border-t-0 md:border-l-2 md:p-12">
              <p className="font-mono text-xs tracking-[0.25em] uppercase">{t('landing.final.stub')}</p>
              <MagneticLink
                href={`/${defaultCity}`}
                className={buttonVariants({ variant: 'primary', size: 'lg' })}
              >
                {t('landing.final.cta')}
                <ArrowRight aria-hidden="true" />
              </MagneticLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
