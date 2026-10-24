'use client';

import { useState } from 'react';
import { useVegOnly } from '@/features/dishes/hooks/use-veg-only';
import { t, type MessageKey } from '@/i18n';
import { formatRupees } from '@/shared/lib/money';
import { ChipButton } from '@/shared/ui/chip';
import { moodIds, moodPicks, moodRoute, type MoodId } from '../lib/content';
import { useSetModeRoute } from './mode-tabs.client';

const moodLabel: Record<MoodId, MessageKey> = {
  'rainy-day': 'chips.rainyDay',
  'date-night': 'chips.dateNight',
  'family-sunday': 'chips.family',
  'late-night': 'chips.lateNight',
  'under-300': 'chips.under300',
};

/** Mood trails preview: one tap turns a mood into three options. */
export function MoodPanel() {
  const vegOnly = useVegOnly();
  const setRoute = useSetModeRoute();
  const [mood, setMood] = useState<MoodId>('rainy-day');
  const picks = moodPicks[mood].filter((pick) => !vegOnly || pick.diet === 'veg').slice(0, 3);

  function choose(next: MoodId) {
    setMood(next);
    setRoute('mood', moodRoute(next));
  }

  return (
    <>
      <h3 className="mb-4 type-title-l">{t('landing.modes.mood.title')}</h3>
      <div
        role="group"
        aria-label={t('landing.modes.mood.label')}
        className="mb-5 no-scrollbar flex gap-2 overflow-x-auto py-1"
      >
        {moodIds.map((id) => (
          <ChipButton key={id} selected={mood === id} onClick={() => choose(id)}>
            {t(moodLabel[id])}
          </ChipButton>
        ))}
      </div>
      <ul aria-live="polite" className="grid gap-3 sm:grid-cols-3">
        {picks.map((pick) => (
          <li
            key={pick.dish}
            data-diet={pick.diet}
            className="flex flex-col gap-1.5 rounded-2xl border-2 border-ink bg-cream p-3.5"
          >
            <span className="font-display text-lg leading-tight font-extrabold">{pick.dish}</span>
            <span className="text-sm text-inkMuted">
              {t('place.inArea', { place: pick.place.name, area: pick.place.area })}
            </span>
            <span className="mt-auto text-xs">{formatRupees(pick.pricePaise)}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
