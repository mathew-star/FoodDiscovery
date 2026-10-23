import { t, type MessageKey } from '@/i18n';
import { Reveal } from './reveal';

const items: { name: MessageKey; body: MessageKey }[] = [
  { name: 'landing.menu.whatToOrder', body: 'landing.menu.whatToOrderBody' },
  { name: 'landing.menu.cityRanking', body: 'landing.menu.cityRankingBody' },
  { name: 'landing.menu.battles', body: 'landing.menu.battlesBody' },
  { name: 'landing.menu.livingFacts', body: 'landing.menu.livingFactsBody' },
  { name: 'landing.menu.askLocals', body: 'landing.menu.askLocalsBody' },
  { name: 'landing.menu.whatsapp', body: 'landing.menu.whatsappBody' },
];

export function MenuBoard() {
  return (
    <section id="menu" aria-labelledby="menu-title" className="scroll-mt-20">
      <div className="mx-auto max-w-[1240px] px-4 py-16 md:px-6 md:py-24">
        <div className="border-2 border-ink bg-raised p-6 shadow-lift-lg md:p-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-4 border-double border-ink pb-4">
            <h2 id="menu-title" className="text-6xl font-extrabold md:text-7xl">
              {t('landing.menu.title')}
            </h2>
            <p className="font-mono text-xs tracking-widest text-ink-soft uppercase">
              {t('landing.menu.kicker')}
            </p>
          </div>
          <ul className="mt-8 grid gap-x-14 gap-y-8 md:grid-cols-2">
            {items.map(({ name, body }, index) => (
              <li key={name}>
                <Reveal delay={(index % 2) * 0.08} className="flex flex-col gap-1.5">
                  <p className="flex items-baseline gap-3">
                    <span className="font-display text-3xl font-bold [font-stretch:80%]">{t(name)}</span>
                    <span aria-hidden="true" className="leader" />
                    <span className="font-mono text-sm text-ink-soft tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </p>
                  <p className="text-ink-soft">{t(body)}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
