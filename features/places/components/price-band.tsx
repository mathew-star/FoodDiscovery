import { t } from '@/i18n';

export function PriceBand({ band }: { band: number }) {
  return (
    <span className="text-xs tabular-nums">
      <span aria-hidden="true">
        {'₹'.repeat(band)}
        <span className="text-ink/25">{'₹'.repeat(Math.max(0, 4 - band))}</span>
      </span>
      <span className="sr-only">{t('place.priceBand', { band })}</span>
    </span>
  );
}
