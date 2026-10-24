import { t } from '@/i18n';
import { places } from '../lib/content';
import { SixStepsJourney } from './six-apps.client';

/** Section 2A: the problem, told as the six steps of one dinner decision. */
export function SixApps() {
  return (
    <section
      id="six-apps"
      aria-labelledby="six-title"
      className="relative border-b-4 border-ink bg-paper py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-center gap-10 px-5 md:px-10 lg:grid-cols-12 lg:gap-14">
        <SixStepsJourney
          place={t('place.inArea', {
            place: places.deccanOldCity.name,
            area: places.deccanOldCity.area,
          })}
          intro={
            <>
              <h2 id="six-title" className="type-display-l">
                {t('landing.sixApps.titleLine1')}
                <br />
                {t('landing.sixApps.titleLine2')}
              </h2>
              <p className="max-w-md text-lg leading-relaxed text-inkMuted">{t('landing.sixApps.body')}</p>
            </>
          }
        />
      </div>
    </section>
  );
}
