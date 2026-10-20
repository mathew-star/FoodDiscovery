import { Clock } from 'lucide-react';
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

type OpenStatusProps = { hours: HoursRow[]; timezone: string; className?: string };

async function LiveOpenStatus({ hours, timezone, className }: OpenStatusProps) {
  await connection();
  const now = new Date();
  const status = getOpenStatus(hours, now, timezone);

  if (status.state === 'unknown') {
    return <span className={cn('text-sm text-muted', className)}>{t('place.hoursUnknown')}</span>;
  }

  if (status.state === 'open') {
    return (
      <span className={cn('inline-flex items-center gap-1 text-sm font-semibold text-accent', className)}>
        <Clock aria-hidden="true" className="size-4" />
        {t('place.open')}
        <span className="font-normal text-text">· {t('place.closesAt', { time: status.closesAt })}</span>
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
    <span className={cn('inline-flex items-center gap-1 text-sm font-semibold text-danger', className)}>
      <Clock aria-hidden="true" className="size-4" />
      {t('place.closed')}
      <span className="font-normal text-text">· {opens}</span>
    </span>
  );
}

export function OpenStatus(props: OpenStatusProps) {
  return (
    <Suspense
      fallback={<span className={cn('text-sm text-muted', props.className)}>{t('place.checking')}</span>}
    >
      <LiveOpenStatus {...props} />
    </Suspense>
  );
}
