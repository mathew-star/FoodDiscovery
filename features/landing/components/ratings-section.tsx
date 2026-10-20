import { DietMark } from '@/features/dishes/components/diet-mark';
import { diets } from '@/features/dishes/schemas/diet';
import { t } from '@/i18n';
import { Reveal } from './reveal';
import { StampDemo } from './stamp-demo.client';

export function RatingsSection() {
  return (
    <section aria-labelledby="ratings-title">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <Reveal className="flex flex-col gap-5">
          <h2 id="ratings-title" className="text-6xl font-extrabold md:text-7xl">
            {t('landing.stampDemo.title')}
          </h2>
          <p className="max-w-md text-lg text-ink-soft">{t('landing.stampDemo.body')}</p>
          <div className="mt-4 flex flex-col gap-3 border-t-2 border-dashed border-rule-strong pt-5">
            <h3 className="text-2xl font-bold">{t('landing.stampDemo.dietTitle')}</h3>
            <p className="text-ink-soft">{t('landing.stampDemo.dietBody')}</p>
            <ul className="flex flex-wrap gap-5">
              {diets.map((diet) => (
                <li key={diet}>
                  <DietMark diet={diet} showLabel size="md" className="text-sm" />
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <StampDemo />
      </div>
    </section>
  );
}
