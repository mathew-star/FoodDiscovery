import { DietMark } from '@/features/dishes/components/diet-mark';
import { RatingBadge } from '@/features/ratings/components/rating-badge';
import { t } from '@/i18n';

export function KotStack() {
  return (
    <figure aria-label={t('landing.kot.label')} className="group relative mx-auto w-full max-w-sm pt-6 pb-10">
      <div
        aria-hidden="true"
        className="absolute top-0 right-[-6%] left-[18%] h-[88%] rotate-[8deg] border-2 border-ink bg-sunk shadow-lift transition-transform duration-(--dur-ui) ease-snap group-hover:translate-x-6 group-hover:rotate-[10deg]"
      />
      <div
        aria-hidden="true"
        className="absolute top-3 right-[14%] left-[-8%] h-[86%] -rotate-[7deg] border-2 border-ink bg-raised shadow-lift transition-transform duration-(--dur-ui) ease-snap group-hover:-translate-x-6 group-hover:-rotate-[7deg]"
      />
      <div className="relative drop-shadow-[6px_6px_0_var(--lift-color)] transition-transform duration-(--dur-ui) ease-snap group-hover:-translate-y-2">
        <div className="relative bg-raised px-5 pt-5 pb-9 font-mono text-sm perforate-b">
          <div className="flex justify-between text-2xs tracking-widest text-ink-soft uppercase">
            <span>{t('landing.kot.number')}</span>
            <span>{t('landing.kot.table')}</span>
          </div>
          <hr aria-hidden="true" className="my-3 border-0 border-t-2 border-dashed border-rule-strong" />
          <div className="flex items-start gap-2">
            <DietMark diet="nonveg" className="mt-1" />
            <p className="font-display text-4xl leading-none font-extrabold [font-stretch:72%]">
              {t('landing.kot.dish')}
            </p>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span>{t('landing.kot.qty')}</span>
            <span aria-hidden="true" className="leader" />
            <span className="font-bold tabular-nums">{t('landing.kot.price')}</span>
          </div>
          <p className="mt-3 text-xs uppercase">{t('landing.kot.area')}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-live uppercase">
            <span aria-hidden="true" className="size-2 rounded-full bg-live" />
            {t('landing.kot.open')}
          </p>
          <hr aria-hidden="true" className="my-3 border-0 border-t-2 border-dashed border-rule-strong" />
          <p className="text-xs text-ink-soft uppercase">{t('landing.kot.meter')}</p>
          <RatingBadge
            sentiment="loved"
            size="lg"
            animate
            index={4}
            className="absolute -right-3 bottom-10 bg-raised/80"
          />
        </div>
      </div>
    </figure>
  );
}
