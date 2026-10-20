import { t } from '@/i18n';

export function PriceBand({ band }: { band: number }) {
  return (
    <span className="text-sm font-semibold tracking-wider tabular-nums">
      <span aria-hidden="true">
        {'₹'.repeat(band)}
        <span className="text-border-strong">{'₹'.repeat(Math.max(0, 4 - band))}</span>
      </span>
      <span className="sr-only">{t('place.priceBand', { band })}</span>
    </span>
  );
}
