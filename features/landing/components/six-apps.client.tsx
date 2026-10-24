'use client';

import {
  Camera,
  Check,
  Clock,
  FileText,
  MapPin,
  MessagesSquare,
  Phone,
  Star,
  type LucideIcon,
} from 'lucide-react';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { t, type MessageKey } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { buttonVariants } from '@/shared/ui/button';
import { cardVariants } from '@/shared/ui/card';
import { journeyMinutes, journeyStepIds, type JourneyStepId } from '../lib/content';

const stepApp: Record<JourneyStepId, { icon: LucideIcon; tone: string }> = {
  discover: { icon: Camera, tone: 'bg-creamDark' },
  dish: { icon: Star, tone: 'bg-saffron' },
  distance: { icon: MapPin, tone: 'bg-cream' },
  price: { icon: FileText, tone: 'bg-paper' },
  trust: { icon: MessagesSquare, tone: 'bg-lime' },
  call: { icon: Phone, tone: 'bg-limeBright' },
};

const answerActions: MessageKey[] = ['place.directions', 'place.call', 'place.save'];

/** Both states share one grid cell, so swapping never changes the card's height. */
const stack = 'grid [&>*]:col-start-1 [&>*]:row-start-1';

function layer(visible: boolean): string {
  return cn(
    'transition-[opacity,translate] duration-(--dur-swap) ease-out',
    visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0',
  );
}

function AppTile({ icon: Icon, tone }: { icon: LucideIcon; tone: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-[10px] border-[1.5px] border-ink',
        tone,
      )}
    >
      <Icon className="size-4" strokeWidth={2.25} />
    </span>
  );
}

type SixStepsJourneyProps = { intro: ReactNode; place: string };

/**
 * Section 2A, the problem as a story: the six questions behind one dinner decision and the app each
 * one sends people to today. "Do it in one page" swaps every step to FDN's answer for the same
 * question (DESIGN-SYSTEM §8 `swap`, staggered; instant under reduced motion).
 */
export function SixStepsJourney({ intro, place }: SixStepsJourneyProps) {
  const [solved, setSolved] = useState(false);

  return (
    <>
      <div className="space-y-6 lg:col-span-5">
        {intro}
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            aria-pressed={solved}
            aria-controls="six-steps"
            onClick={() => setSolved((value) => !value)}
            className={buttonVariants({ variant: 'primary' })}
          >
            {solved ? t('landing.sixApps.expand') : t('landing.sixApps.collapse')}
          </button>
          <span aria-live="polite" className="text-xs text-inkMuted">
            {solved ? t('landing.sixApps.after') : t('landing.sixApps.before')}
          </span>
        </div>
      </div>

      <ol
        id="six-steps"
        aria-label={t('landing.sixApps.listLabel')}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7"
      >
        {journeyStepIds.map((id, index) => {
          const delay = { transitionDelay: solved ? `${index * 60}ms` : '0ms' } as CSSProperties;
          return (
            <li key={id} className={cn(cardVariants({ size: 'md' }), 'flex flex-col gap-3 p-4')}>
              <div className="flex items-center justify-between gap-2 text-[11px] text-inkMuted">
                <span>{t('landing.sixApps.stepLabel', { n: index + 1 })}</span>
                <span className={stack}>
                  <span
                    aria-hidden={solved}
                    style={delay}
                    className={cn('flex items-center gap-1', layer(!solved))}
                  >
                    <Clock aria-hidden="true" className="size-3" strokeWidth={2.5} />
                    {t('landing.sixApps.minutes', { n: journeyMinutes[id] })}
                  </span>
                  <span
                    aria-hidden={!solved}
                    style={delay}
                    className={cn('flex items-center justify-end gap-1 text-oliveDeep', layer(solved))}
                  >
                    <Clock aria-hidden="true" className="size-3" strokeWidth={2.5} />
                    {t('landing.sixApps.seconds')}
                  </span>
                </span>
              </div>

              <p className="type-title-s">{t(`landing.sixApps.steps.${id}.question`)}</p>

              <div className={cn(stack, 'border-t-2 border-dashed border-ink/20 pt-3')}>
                <div aria-hidden={solved} style={delay} className={cn('flex gap-3', layer(!solved))}>
                  <AppTile {...stepApp[id]} />
                  <p className="flex flex-col">
                    <span className="text-xs">{t(`landing.sixApps.steps.${id}.app`)}</span>
                    <span className="text-sm leading-snug text-inkMuted">
                      {t(`landing.sixApps.steps.${id}.pain`)}
                    </span>
                  </p>
                </div>
                <div aria-hidden={!solved} style={delay} className={cn('flex gap-3', layer(solved))}>
                  <AppTile icon={Check} tone="bg-olive" />
                  <p className="flex flex-col">
                    <span className="text-xs">{t('landing.sixApps.oneApp')}</span>
                    <span className="text-sm leading-snug">{t(`landing.sixApps.steps.${id}.answer`)}</span>
                  </p>
                </div>
              </div>
            </li>
          );
        })}

        <li
          className={cn(
            cardVariants({ size: 'md', tone: solved ? 'lime' : 'cream' }),
            stack,
            'p-5 transition-colors duration-(--dur-swap) sm:col-span-2',
          )}
        >
          <div aria-hidden={solved} className={cn('flex flex-col gap-1', layer(!solved))}>
            <span className="text-[11px] text-inkMuted">{t('landing.sixApps.totalLabel')}</span>
            <span className="type-title-m">{t('landing.sixApps.totalBefore')}</span>
            <span className="text-sm text-inkMuted">{t('landing.sixApps.summaryBefore')}</span>
          </div>
          <div
            aria-hidden={!solved}
            className={cn('flex flex-wrap items-end justify-between gap-4', layer(solved))}
          >
            <div className="flex flex-col gap-1">
              <span className="text-[11px]">{t('landing.sixApps.answerLabel')}</span>
              <span className="type-title-m">{place}</span>
              <span className="text-sm">{t('landing.sixApps.totalAfter')}</span>
            </div>
            <div aria-hidden="true" className="flex gap-2 text-[11px]">
              {answerActions.map((key, index) => (
                <span
                  key={key}
                  className={cn(
                    'rounded-full border border-ink px-3 py-1.5',
                    index === 0 ? 'bg-ink text-cream' : 'bg-paper',
                  )}
                >
                  {t(key)}
                </span>
              ))}
            </div>
          </div>
        </li>
      </ol>
    </>
  );
}
