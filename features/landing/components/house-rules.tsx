import { t, type MessageKey } from '@/i18n';
import { Stamp } from '@/shared/ui/stamp';
import { Reveal } from './reveal';

const rules: MessageKey[] = [
  'landing.rules.r1',
  'landing.rules.r2',
  'landing.rules.r3',
  'landing.rules.r4',
  'landing.rules.r5',
];

export function HouseRules() {
  return (
    <section id="rules" aria-labelledby="rules-title" className="scroll-mt-20 bg-ink text-on-ink">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal className="flex flex-col gap-3">
          <p className="font-mono text-xs tracking-[0.25em] text-haldi uppercase">
            {t('landing.rules.kicker')}
          </p>
          <h2 id="rules-title" className="text-7xl font-extrabold md:text-8xl">
            {t('landing.rules.title')}
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="relative border-4 border-double border-on-ink/70 p-6 md:p-10">
          <ol className="flex flex-col gap-5">
            {rules.map((key, index) => (
              <li key={key} className="flex gap-5">
                <span className="font-display text-4xl leading-none font-extrabold text-haldi [font-stretch:70%] tabular-nums">
                  {index + 1}.
                </span>
                <p className="font-display text-2xl leading-tight font-bold uppercase [font-stretch:80%] md:text-3xl">
                  {t(key)}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-8 font-mono text-2xs tracking-widest uppercase opacity-80">
            — {t('landing.rules.signoff')}
          </p>
          <Stamp size="lg" tilt={-10} className="absolute -top-5 right-6 bg-ink text-haldi">
            {t('landing.trust.stampWord')}
          </Stamp>
        </Reveal>
      </div>
    </section>
  );
}
