import { Check, CircleAlert } from 'lucide-react';
import { t, type MessageKey } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { formatRupees } from '@/shared/lib/money';
import { Stamp } from '@/shared/ui/stamp';
import type { BranchDetail } from '../queries/branches';
import { factValueSchemas, type FactField } from '../schemas/facts';

const dayKeys: MessageKey[] = [
  'place.days.d1',
  'place.days.d2',
  'place.days.d3',
  'place.days.d4',
  'place.days.d5',
  'place.days.d6',
  'place.days.d0',
];
const dayOrder = [1, 2, 3, 4, 5, 6, 0];
const paymentKey: Record<'cash' | 'upi' | 'card', MessageKey> = {
  cash: 'place.paymentCash',
  upi: 'place.paymentUpi',
  card: 'place.paymentCard',
};
const fieldLabel: Record<FactField, MessageKey> = {
  hours: 'place.hours',
  price_range: 'place.priceRange',
  phone: 'place.phone',
  address: 'place.address',
  payment_modes: 'place.payments',
  veg_only: 'place.vegOnlyFact',
};
const fieldOrder: FactField[] = ['hours', 'price_range', 'address', 'phone', 'payment_modes', 'veg_only'];

type Fact = BranchDetail['facts'][number];

function short(time: string): string {
  return time.slice(0, 5);
}

function FactValue({ fact }: { fact: Fact }) {
  switch (fact.field) {
    case 'hours': {
      const parsed = factValueSchemas.hours.safeParse(fact.value);
      if (!parsed.success) return null;
      return (
        <table className="w-full text-sm">
          <tbody>
            {dayOrder.map((day, index) => {
              const slots = parsed.data.filter((row) => row.dayOfWeek === day);
              return (
                <tr key={day} className="align-top">
                  <th
                    scope="row"
                    className="py-0.5 pr-3 text-left font-mono text-xs font-normal text-ink-soft uppercase"
                  >
                    {t(dayKeys[index] ?? 'place.days.d0')}
                  </th>
                  <td className="py-0.5 text-right font-mono text-xs tabular-nums">
                    {slots.length === 0
                      ? t('place.closed')
                      : slots.map((slot) => `${short(slot.opensAt)}–${short(slot.closesAt)}`).join(', ')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
    case 'price_range': {
      const parsed = factValueSchemas.price_range.safeParse(fact.value);
      return parsed.success ? (
        <span className="tabular-nums">{`${formatRupees(parsed.data.minPaise)} – ${formatRupees(parsed.data.maxPaise)}`}</span>
      ) : null;
    }
    case 'address': {
      const parsed = factValueSchemas.address.safeParse(fact.value);
      return parsed.success ? <address className="not-italic">{parsed.data.address}</address> : null;
    }
    case 'phone': {
      const parsed = factValueSchemas.phone.safeParse(fact.value);
      return parsed.success ? <span>{parsed.data.phone}</span> : null;
    }
    case 'payment_modes': {
      const parsed = factValueSchemas.payment_modes.safeParse(fact.value);
      return parsed.success ? (
        <span>{parsed.data.modes.map((mode) => t(paymentKey[mode])).join(' · ')}</span>
      ) : null;
    }
    case 'veg_only': {
      const parsed = factValueSchemas.veg_only.safeParse(fact.value);
      return parsed.success ? <span>{parsed.data.vegOnly ? t('place.yes') : t('place.no')}</span> : null;
    }
  }
}

function Freshness({ fact }: { fact: Fact }) {
  const label =
    fact.ageDays === 0 ? t('place.confirmedToday') : t('place.confirmedDaysAgo', { days: fact.ageDays });
  return (
    <p
      className={cn(
        'flex flex-wrap items-center gap-x-1 font-mono text-2xs uppercase',
        fact.stale ? 'font-bold text-danger' : 'text-ink-soft',
      )}
    >
      {fact.stale ? (
        <CircleAlert aria-hidden="true" className="size-3.5" />
      ) : (
        <Check aria-hidden="true" className="size-3.5" />
      )}
      {label}
      {fact.stale ? <span>· {t('place.needsConfirming')}</span> : null}
    </p>
  );
}

export function FactsCard({ facts }: { facts: Fact[] }) {
  const ordered = fieldOrder.flatMap((field) => facts.filter((fact) => fact.field === field));
  return (
    <section aria-label={t('place.factsReceipt')} className="drop-shadow-[3px_3px_0_var(--lift-color)]">
      <div className="bg-raised px-5 pt-5 pb-8 font-mono text-sm perforate-b">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-3xl font-extrabold">{t('place.facts')}</h2>
            <p className="text-2xs text-ink-soft uppercase">{t('place.factsNote')}</p>
          </div>
          <Stamp size="sm" tilt={9} animate className="text-live">
            {t('place.factsStamp')}
          </Stamp>
        </div>
        <hr aria-hidden="true" className="my-4 border-0 border-t-2 border-dashed border-rule-strong" />
        <dl className="flex flex-col gap-4">
          {ordered.map((fact) => (
            <div key={fact.field} className="flex flex-col gap-1.5">
              <dt className="text-2xs font-bold tracking-widest uppercase">{t(fieldLabel[fact.field])}</dt>
              <dd className="font-sans text-base">
                <FactValue fact={fact} />
              </dd>
              <dd>
                <Freshness fact={fact} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
