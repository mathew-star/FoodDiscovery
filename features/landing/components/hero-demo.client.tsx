'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useVegOnly } from '@/features/dishes/hooks/use-veg-only';
import { defaultCity } from '@/features/geo/schemas/city';
import { CommandBar } from '@/features/search/components/command-bar.client';
import { searchExamples } from '@/features/search/lib/examples';
import { useSignInPrompt } from '@/features/shell/hooks/use-sign-in-prompt';
import { t, type MessageKey } from '@/i18n';
import { ChipButton } from '@/shared/ui/chip';
import { proofSetIds, proofSets, type ProofSetId } from '../lib/content';
import { ProofCard } from './proof-card';

const chipLabel: Record<ProofSetId, MessageKey> = {
  open: 'chips.openNow',
  under300: 'chips.under300',
  late: 'chips.lateNight',
  biryani: 'chips.biryaniLeaderboard',
  veg: 'chips.veg',
};

const swapMs = 180;

/** Veg-only mode never shows a non-veg answer; it falls back to the veg set. */
function forDiet(id: ProofSetId, vegOnly: boolean): ProofSetId {
  return vegOnly && proofSets[id].diet !== 'veg' ? 'veg' : id;
}

type HeroDemoProps = { title: ReactNode; footer: ReactNode; aside: ReactNode };

/**
 * Hero live demo (DESIGN-SYSTEM §13 #1): chips and search drive the proof card, so the first
 * interaction already shows an answer.
 */
export function HeroDemo({ title, footer, aside }: HeroDemoProps) {
  const vegOnly = useVegOnly();
  const prompt = useSignInPrompt();
  const [chosen, setChosen] = useState<ProofSetId>('open');
  const [displayed, setDisplayed] = useState<ProofSetId>('open');
  const [swapping, setSwapping] = useState(false);
  const [confirmed, setConfirmed] = useState<ProofSetId | null>(null);
  const [query, setQuery] = useState('');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const active = forDiet(chosen, vegOnly);
  const shown = forDiet(displayed, vegOnly);

  function choose(id: ProofSetId) {
    setChosen(id);
    setQuery(t(`landing.hero.sets.${id}.query`));
    window.clearTimeout(timer.current);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayed(id);
      return;
    }
    setSwapping(true);
    timer.current = window.setTimeout(() => {
      setDisplayed(id);
      setSwapping(false);
    }, swapMs);
  }

  function stillTrue() {
    setConfirmed(shown);
    prompt(t('intent.stillTrue'));
  }

  return (
    <>
      <div className="space-y-7 lg:col-span-7">
        {title}
        <div className="max-w-2xl">
          <CommandBar
            action={`/${defaultCity}/search`}
            id="hero-search"
            label={t('landing.hero.searchLabel')}
            placeholder={searchExamples[0] ?? t('search.placeholder')}
            examples={searchExamples}
            value={query}
            onValueChange={setQuery}
          />
          <div
            role="group"
            aria-label={t('chips.label')}
            className="-mx-5 mt-4 no-scrollbar flex gap-2 overflow-x-auto px-5 py-1 sm:mx-0 sm:flex-wrap sm:px-0"
          >
            {proofSetIds.map((id) => (
              <ChipButton key={id} selected={active === id} onClick={() => choose(id)}>
                {t(chipLabel[id])}
              </ChipButton>
            ))}
          </div>
        </div>
        {footer}
      </div>
      <div className="space-y-5 lg:col-span-5">
        <ProofCard
          id={shown}
          set={proofSets[shown]}
          swapping={swapping}
          confirmed={confirmed === shown}
          onStillTrue={stillTrue}
        />
        {aside}
      </div>
    </>
  );
}
