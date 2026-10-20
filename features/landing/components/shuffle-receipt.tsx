import { t, type MessageKey } from '@/i18n';
import { Stamp } from '@/shared/ui/stamp';
import { Reveal } from './reveal';

const items: MessageKey[] = [
  'landing.shuffle.i1',
  'landing.shuffle.i2',
  'landing.shuffle.i3',
  'landing.shuffle.i4',
  'landing.shuffle.i5',
  'landing.shuffle.i6',
];

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <li className={strong ? 'flex items-baseline gap-2 text-base font-bold' : 'flex items-baseline gap-2'}>
      <span>{label}</span>
      <span aria-hidden="true" className="leader" />
      <span className="shrink-0 tabular-nums">{value}</span>
    </li>
  );
}

export function ShuffleReceipt() {
  return (
    <section aria-labelledby="shuffle-title" className="border-y-2 border-ink bg-sunk">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-2 lg:items-center">
        <Reveal className="flex flex-col gap-4">
          <h2 id="shuffle-title" className="text-6xl font-extrabold md:text-7xl">
            {t('landing.shuffle.title')}
          </h2>
          <p className="max-w-md text-lg text-ink-soft">{t('landing.shuffle.body')}</p>
        </Reveal>
        <Reveal
          delay={0.1}
          className="relative mx-auto w-full max-w-md -rotate-1 drop-shadow-[6px_6px_0_var(--lift-color)]"
        >
          <div className="bg-raised px-6 pt-6 pb-10 font-mono text-sm perforate-b">
            <p className="text-center text-2xs tracking-[0.25em] text-ink-soft uppercase">
              {t('landing.shuffle.receipt')}
            </p>
            <hr aria-hidden="true" className="my-4 border-0 border-t-2 border-dashed border-rule-strong" />
            <ul className="flex flex-col gap-2.5">
              {items.map((key) => (
                <Row key={key} label={t(key)} value={t('landing.shuffle.unit')} />
              ))}
            </ul>
            <hr aria-hidden="true" className="my-4 border-0 border-t-2 border-dashed border-rule-strong" />
            <ul className="flex flex-col gap-2.5">
              <Row label={t('landing.shuffle.subtotal')} value={t('landing.shuffle.subtotalValue')} />
              <Row label={t('landing.shuffle.discount')} value={t('landing.shuffle.discountValue')} />
              <Row label={t('landing.shuffle.total')} value={t('landing.shuffle.totalValue')} strong />
            </ul>
            <Stamp size="xl" tilt={-12} className="absolute right-4 bottom-12 bg-raised/70 text-live">
              {t('landing.shuffle.stamp')}
            </Stamp>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
