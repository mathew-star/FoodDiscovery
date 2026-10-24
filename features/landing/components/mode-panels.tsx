import Link from 'next/link';
import { t, tRich } from '@/i18n';
import { formatRupees } from '@/shared/lib/money';
import { area, xray } from '../lib/content';

const previewPill = 'rounded-full border border-ink px-3 py-1.5';

/** Restaurant X-Ray preview: what to order here, and what to skip. */
export function XrayPanel() {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="type-title-l">
            {t('place.inArea', { place: xray.place.name, area: xray.place.area })}
          </h3>
          <p className="mt-1 text-xs text-inkMuted">
            {t('landing.modes.xray.meta', {
              cuisines: xray.cuisines,
              price: xray.priceBand,
              distance: t('place.km', { km: xray.distanceKm }),
            })}
            <span className="text-ink">{t('landing.modes.xray.openTill', { time: xray.openTill })}</span>
          </p>
        </div>
        <div aria-hidden="true" className="flex gap-2 text-[11px]">
          <span className={`${previewPill} bg-ink text-cream`}>{t('place.directions')}</span>
          <span className={previewPill}>{t('place.call')}</span>
          <span className={previewPill}>{t('place.rate')}</span>
        </div>
      </div>
      <p className="mb-2 text-xs">{t('place.whatToOrder')}</p>
      <ol className="space-y-2">
        {xray.rows.map((row, index) => (
          <li
            key={row.dish}
            data-diet={row.diet}
            className="flex items-center gap-3 rounded-row border-[1.5px] border-ink bg-cream px-3 py-2.5 text-sm"
          >
            <span className="w-4 shrink-0">{index + 1}</span>
            <span className="grow">
              {row.dish}
              {row.seasonal ? (
                <span className="text-xs text-inkMuted"> ({t('landing.modes.xray.seasonal')})</span>
              ) : null}
            </span>
            <span
              aria-hidden="true"
              className="h-2 w-20 shrink-0 overflow-hidden rounded-full border border-ink bg-paper max-[520px]:hidden"
            >
              <span style={{ width: `${row.lovedPct}%` }} className="block h-full bg-olive" />
            </span>
            <span className="w-12 shrink-0 text-right text-xs font-bold">
              {row.lovedPct}%<span className="sr-only"> {t('rating.lovedWord')}</span>
            </span>
            <span className="w-10 shrink-0 text-right text-[11px] text-inkMuted">
              {formatRupees(row.pricePaise)}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border-[1.5px] border-terracotta bg-terracotta/10 px-3.5 py-2.5">
        <span className="text-sm">
          {tRich('landing.modes.xray.skip', {
            label: <b className="text-terracottaDeep">{t('landing.modes.xray.skipLabel')}</b>,
            dish: xray.skip.dish.toLowerCase(),
            pct: xray.skip.skipPct,
          })}
        </span>
        <span className="shrink-0 text-[11px] text-inkMuted">
          {t('landing.modes.xray.ratings', { count: xray.skip.ratings })}
        </span>
      </div>
    </>
  );
}

/** Area guide preview: tonight in one neighbourhood. */
export function AreaPanel() {
  const stats = [
    { label: t('landing.modes.area.placesOpen'), value: area.stats.open },
    { label: t('landing.modes.area.dishesRated'), value: area.stats.rated },
    { label: t('landing.modes.area.busiest'), value: area.stats.busiest },
  ];
  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h3 className="type-title-l">{t('landing.modes.area.title')}</h3>
        <Link
          href={`/c/${area.slug}`}
          className="text-xs underline underline-offset-4 hover:text-terracottaDeep"
        >
          {t('landing.modes.area.join')}
        </Link>
      </div>
      <dl className="mb-5 grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border-2 border-ink bg-cream p-3">
            <dt className="text-[11px] text-inkMuted">{stat.label}</dt>
            <dd className="font-display text-2xl font-extrabold">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs">{t('landing.modes.area.topDishes')}</p>
          <ol className="space-y-1.5 text-sm">
            {area.topDishes.map((dish) => (
              <li key={dish.dish} data-diet={dish.diet} className="flex justify-between gap-2">
                <span>
                  {dish.dish} · {dish.place.name}
                </span>
                <b className="font-normal">{dish.lovedPct}%</b>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-xl border-2 border-ink bg-lime p-3.5">
          <p className="mb-1 text-[11px]">{t('landing.modes.area.asked')}</p>
          <p className="text-sm leading-snug">{t('landing.modes.area.question')}</p>
          <p className="mt-2 text-[11px]">{t('landing.modes.area.answers')}</p>
        </div>
      </div>
    </>
  );
}
