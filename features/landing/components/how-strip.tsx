import { Footprints, ReceiptText, Search, Stamp as StampIcon, type LucideIcon } from 'lucide-react';
import { t, type MessageKey } from '@/i18n';
import { Reveal } from './reveal';

const steps: { icon: LucideIcon; title: MessageKey; body: MessageKey }[] = [
  { icon: Search, title: 'landing.how.s1.title', body: 'landing.how.s1.body' },
  { icon: ReceiptText, title: 'landing.how.s2.title', body: 'landing.how.s2.body' },
  { icon: Footprints, title: 'landing.how.s3.title', body: 'landing.how.s3.body' },
  { icon: StampIcon, title: 'landing.how.s4.title', body: 'landing.how.s4.body' },
];

export function HowStrip() {
  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-20">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-10 px-4 py-16 md:px-6 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="how-title" className="text-6xl font-extrabold md:text-7xl">
            {t('landing.how.title')}
          </h2>
          <p className="font-mono text-xs tracking-widest text-ink-soft uppercase">
            ✂ {t('landing.how.kicker')}
          </p>
        </div>
        <ol className="grid border-2 border-ink bg-raised shadow-lift-lg md:grid-cols-4">
          {steps.map(({ icon: Icon, title, body }, index) => (
            <li
              key={title}
              className="relative border-dashed border-rule-strong not-last:border-b-2 md:not-last:border-r-2 md:not-last:border-b-0"
            >
              <Reveal delay={index * 0.08} className="flex h-full flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="font-display text-7xl leading-none font-extrabold [font-stretch:70%] tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <Icon aria-hidden="true" className="size-7" />
                </div>
                <h3 className="text-3xl font-bold">{t(title)}</h3>
                <p className="text-ink-soft">{t(body)}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
