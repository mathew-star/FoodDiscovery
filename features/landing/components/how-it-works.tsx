import { defaultCity } from '@/features/geo/schemas/city';
import { t } from '@/i18n';
import { siteUrl } from '@/shared/config/site';
import { area, branchPath, haleemBoard, moodRoute, xray } from '../lib/content';
import { LeaderboardPanel } from './leaderboard-panel.client';
import { AreaPanel, XrayPanel } from './mode-panels';
import { MoodPanel } from './mood-panel.client';
import { ModeTabs } from './mode-tabs.client';

/** Section 2B: four ways in, one confident order. */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="modes-title"
      className="relative border-b-4 border-ink py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1360px] px-5 md:px-10">
        <div className="mb-10 grid grid-cols-1 items-end gap-6 lg:grid-cols-12">
          <h2 id="modes-title" className="type-display-l lg:col-span-7">
            {t('landing.modes.titleLine1')}
            <br />
            {t('landing.modes.titleLine2')}
          </h2>
          <p className="text-lg leading-relaxed text-inkMuted lg:col-span-5">{t('landing.modes.body')}</p>
        </div>
        <ModeTabs
          host={siteUrl.host}
          panels={[
            { id: 'xray', route: branchPath(xray.place), content: <XrayPanel /> },
            { id: 'board', route: haleemBoard.route, content: <LeaderboardPanel /> },
            { id: 'mood', route: moodRoute('rainy-day'), content: <MoodPanel /> },
            { id: 'area', route: `/${defaultCity}/area/${area.slug}`, content: <AreaPanel /> },
          ]}
        />
      </div>
    </section>
  );
}
