import type { CSSProperties } from 'react';
import { t, type MessageKey } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { Reveal } from './reveal';

const slips: { key: MessageKey; tilt: number; tone: string }[] = [
  { key: 'landing.board.city', tilt: -3, tone: 'bg-haldi text-on-haldi' },
  { key: 'landing.board.biryani', tilt: 2, tone: 'bg-raised' },
  { key: 'landing.board.haleem', tilt: -1, tone: 'bg-raised' },
  { key: 'landing.board.cafes', tilt: 4, tone: 'bg-sunk' },
  { key: 'landing.board.streetFood', tilt: -4, tone: 'bg-raised' },
  { key: 'landing.board.budget', tilt: 2, tone: 'bg-ink text-on-ink' },
  { key: 'landing.board.desserts', tilt: -2, tone: 'bg-raised' },
  { key: 'landing.board.veg', tilt: 3, tone: 'bg-sunk' },
];

export function NoticeBoard() {
  return (
    <section aria-labelledby="board-title" className="border-y-2 border-ink bg-sunk">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal className="flex flex-col gap-4">
          <h2 id="board-title" className="text-6xl font-extrabold md:text-7xl">
            {t('landing.board.title')}
          </h2>
          <p className="max-w-md text-lg text-ink-soft">{t('landing.board.body')}</p>
        </Reveal>
        <ul className="flex flex-wrap gap-4">
          {slips.map(({ key, tilt, tone }) => (
            <li
              key={key}
              style={{ '--tilt': `${tilt}deg` } as CSSProperties}
              className={cn(
                'relative rotate-(--tilt) border-2 border-ink px-4 pt-5 pb-3 font-display text-2xl font-bold [font-stretch:80%] shadow-lift-sm transition-transform duration-(--dur-ui) ease-snap hover:rotate-0',
                tone,
              )}
            >
              <span
                aria-hidden="true"
                className="absolute top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full border-2 border-ink bg-rate-loved"
              />
              {t(key)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
