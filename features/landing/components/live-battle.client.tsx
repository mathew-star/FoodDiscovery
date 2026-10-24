'use client';

import { useState } from 'react';
import { useSignInPrompt } from '@/features/shell/hooks/use-sign-in-prompt';
import { t } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { cardVariants } from '@/shared/ui/card';
import { heroBattle } from '../lib/content';

/** Live Dish Battle (spec W7): the split stays hidden until the member votes. */
export function LiveBattle() {
  const prompt = useSignInPrompt();
  const [picked, setPicked] = useState<string | null>(null);

  function vote(id: string) {
    setPicked(id);
    prompt(t('intent.battleVote'));
  }

  return (
    <article aria-labelledby="hero-battle" className={cn(cardVariants({ size: 'lg', tone: 'ink' }), 'p-5')}>
      <div className="mb-3 flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1.5 text-lime">
          <span aria-hidden="true" className="size-2 animate-live-dot rounded-full bg-terracotta" />
          {t('landing.hero.battle.live')}
        </span>
        <span className="text-cream/70">{t('landing.hero.battle.votes')}</span>
      </div>
      <h2 id="hero-battle" className="mb-3 type-title-s">
        {t('landing.hero.battle.question')}
      </h2>
      <div role="group" aria-labelledby="hero-battle" className="grid grid-cols-2 gap-3">
        {heroBattle.sides.map(({ id, place }, index) => {
          const on = picked === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => vote(id)}
              className={cn(
                'rounded-xl border-[1.5px] p-3 text-left transition-colors duration-(--dur-instant)',
                on ? 'border-lime bg-cream/15' : 'border-cream/30 bg-cream/5 hover:border-lime',
              )}
            >
              <span className={cn('block text-[10px]', index === 0 ? 'text-lime' : 'text-saffron')}>
                {place.area}
              </span>
              <span className="mt-0.5 block text-sm">{place.name}</span>
              <span className="mt-2 block text-[11px] text-cream/70">
                {on ? t('landing.hero.battle.yourPick') : t('landing.hero.battle.tapToVote')}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-cream/70">{t('landing.hero.battle.note')}</p>
    </article>
  );
}
