import { Clock, MoonStar } from 'lucide-react';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { t, type MessageKey } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { getOpenStatus, type HoursRow } from '../lib/opening-hours';

const shortDays: MessageKey[] = [
  'place.daysShort.d0',
  'place.daysShort.d1',
  'place.daysShort.d2',
  'place.daysShort.d3',
  'place.daysShort.d4',
  'place.daysShort.d5',
  'place.daysShort.d6',
];

type OpenStatusProps = { hours: HoursRow[]; timezone: string; className?: string; compact?: boolean };

async function LiveOpenStatus({ hours, timezone, className, compact = false }: OpenStatusProps) {
  await connection();
  const now = new Date();
  const status = getOpenStatus(hours, now, timezone);

  if (status.state === 'unknown') {
    return (
      <span className={cn('font-mono text-xs text-ink-soft uppercase', className)}>
        {t('place.hoursUnknown')}
      </span>
    );
  }

  if (status.state === 'open') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 font-mono font-semibold tracking-wide text-live uppercase',
          compact ? 'text-xs' : 'text-sm',
          className,
        )}
      >
        <span aria-hidden="true" className="relative flex size-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-live opacity-60 motion-reduce:hidden" />
          <span className="relative size-2 rounded-full bg-live" />
        </span>
        {t('place.open')}
        <span className="font-normal text-ink">· {t('place.closesAt', { time: status.closesAt })}</span>
      </span>
    );
  }

  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short' }).format(now);
  const todayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday);
  const opens =
    status.nextDayOffset === 0
      ? t('place.opensAt', { time: status.opensAt })
      : status.nextDayOffset === 1
        ? t('place.opensTomorrow', { time: status.opensAt })
        : t('place.opensLater', {
            day: t(shortDays[(todayIndex + status.nextDayOffset) % 7] ?? 'place.daysShort.d0'),
            time: status.opensAt,
          });

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono font-semibold tracking-wide text-ink-soft uppercase',
        compact ? 'text-xs' : 'text-sm',
        className,
      )}
    >
      <MoonStar aria-hidden="true" className="size-3.5" />
      {t('place.closed')}
      <span className="font-normal text-ink">· {opens}</span>
    </span>
  );
}

export function OpenStatus(props: OpenStatusProps) {
  return (
    <Suspense
      fallback={
        <span
          className={cn(
            'inline-flex items-center gap-1.5 font-mono text-xs text-ink-soft uppercase',
            props.className,
          )}
        >
          <Clock aria-hidden="true" className="size-3.5" />
          {t('place.checking')}
        </span>
      }
    >
      <LiveOpenStatus {...props} />
    </Suspense>
  );
}
