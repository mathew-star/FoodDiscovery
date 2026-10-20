import { CircleAlert } from 'lucide-react';
import { t, type MessageKey } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { formatRupees } from '@/shared/lib/money';
import { Card } from '@/shared/ui/card';
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
                  <th scope="row" className="py-0.5 pr-3 text-left font-normal text-muted">
                    {t(dayKeys[index] ?? 'place.days.d0')}
                  </th>
                  <td className="py-0.5 text-right tabular-nums">
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
        'flex items-center gap-1 text-xs',
        fact.stale ? 'font-semibold text-danger' : 'text-muted',
      )}
    >
      {fact.stale ? <CircleAlert aria-hidden="true" className="size-3.5" /> : null}
      {label}
      {fact.stale ? <span>· {t('place.needsConfirming')}</span> : null}
    </p>
  );
}

export function FactsCard({ facts }: { facts: Fact[] }) {
  const ordered = fieldOrder.flatMap((field) => facts.filter((fact) => fact.field === field));
  return (
    <Card className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-sans text-lg font-semibold">{t('place.facts')}</h2>
        <p className="text-xs text-muted">{t('place.factsNote')}</p>
      </div>
      <dl className="flex flex-col divide-y divide-border">
        {ordered.map((fact) => (
          <div key={fact.field} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
            <dt className="text-sm font-semibold">{t(fieldLabel[fact.field])}</dt>
            <dd className="text-sm">
              <FactValue fact={fact} />
            </dd>
            <dd>
              <Freshness fact={fact} />
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
