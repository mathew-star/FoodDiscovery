import { Clock } from 'lucide-react';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { t, type MessageKey } from '@/i18n';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/badge';
import { getOpenStatus, type HoursRow, type OpenStatus as Status } from '../lib/opening-hours';

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

function nextOpening(status: Extract<Status, { state: 'closed' }>, now: Date, timezone: string): string {
  if (status.nextDayOffset === 0) return t('place.opensAt', { time: status.opensAt });
  if (status.nextDayOffset === 1) return t('place.opensTomorrow', { time: status.opensAt });
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short' }).format(now);
  const todayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekday);
  return t('place.opensLater', {
    day: t(shortDays[(todayIndex + status.nextDayOffset) % 7] ?? 'place.daysShort.d0'),
    time: status.opensAt,
  });
}

async function LiveOpenStatus({ hours, timezone, className }: OpenStatusProps) {
  await connection();
  const now = new Date();
  const status = getOpenStatus(hours, now, timezone);

  if (status.state === 'unknown') {
    return <span className={cn('text-xs text-inkMuted', className)}>{t('place.hoursUnknown')}</span>;
  }
  if (status.state === 'open') {
    return (
      <Badge tone="lime" className={className}>
        {t('place.openTill', { time: status.closesAt })}
      </Badge>
    );
  }
  return (
    <Badge tone="paper" className={className}>
      {t('place.closedWithNext', { next: nextOpening(status, now, timezone) })}
    </Badge>
  );
}

/** Request-time open/closed badge on otherwise static pages (ARCHITECTURE D21). */
export function OpenStatus(props: OpenStatusProps) {
  return (
    <Suspense
      fallback={
        <span className={cn('inline-flex items-center gap-1 text-xs text-inkMuted', props.className)}>
          <Clock aria-hidden="true" className="size-3.5" />
          {t('place.checking')}
        </span>
      }
    >
      <LiveOpenStatus {...props} />
    </Suspense>
  );
}
