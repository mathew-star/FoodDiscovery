export type HoursRow = { dayOfWeek: number; opensAt: string; closesAt: string };

export type OpenStatus =
  | { state: 'open'; closesAt: string; closesInMinutes: number; nextDayOffset: number }
  | { state: 'closed'; opensAt: string; opensInMinutes: number; nextDayOffset: number }
  | { state: 'unknown' };

const MINUTES_PER_DAY = 1_440;
const MINUTES_PER_WEEK = MINUTES_PER_DAY * 7;
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toMinutes(value: string): number {
  const [hours = '0', minutes = '0'] = value.split(':');
  return Number(hours) * 60 + Number(minutes);
}

function formatClock(minuteOfWeek: number): string {
  const minuteOfDay = ((minuteOfWeek % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(minuteOfDay / 60);
  const minutes = minuteOfDay % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function localMinuteOfWeek(now: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '0';
  const day = weekdays.indexOf(value('weekday'));
  return day * MINUTES_PER_DAY + Number(value('hour')) * 60 + Number(value('minute'));
}

function weeklyIntervals(rows: readonly HoursRow[]): [number, number][] {
  const intervals = rows.map(({ dayOfWeek, opensAt, closesAt }): [number, number] => {
    const start = dayOfWeek * MINUTES_PER_DAY + toMinutes(opensAt);
    let end = dayOfWeek * MINUTES_PER_DAY + toMinutes(closesAt);
    if (end <= start) end += MINUTES_PER_DAY;
    return [start, end];
  });
  const expanded = intervals.flatMap(([start, end]): [number, number][] => [
    [start - MINUTES_PER_WEEK, end - MINUTES_PER_WEEK],
    [start, end],
    [start + MINUTES_PER_WEEK, end + MINUTES_PER_WEEK],
  ]);
  expanded.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const interval of expanded) {
    const last = merged.at(-1);
    if (last && interval[0] <= last[1]) last[1] = Math.max(last[1], interval[1]);
    else merged.push([...interval]);
  }
  return merged;
}

export function getOpenStatus(rows: readonly HoursRow[], now: Date, timeZone: string): OpenStatus {
  if (rows.length === 0) return { state: 'unknown' };
  const current = localMinuteOfWeek(now, timeZone);
  const intervals = weeklyIntervals(rows);
  const today = Math.floor(current / MINUTES_PER_DAY);
  const dayOffset = (minute: number) => Math.floor(minute / MINUTES_PER_DAY) - today;

  const open = intervals.find(([start, end]) => start <= current && current < end);
  if (open) {
    return {
      state: 'open',
      closesAt: formatClock(open[1]),
      closesInMinutes: open[1] - current,
      nextDayOffset: dayOffset(open[1]),
    };
  }
  const next = intervals.find(([start]) => start > current);
  if (!next) return { state: 'unknown' };
  return {
    state: 'closed',
    opensAt: formatClock(next[0]),
    opensInMinutes: next[0] - current,
    nextDayOffset: dayOffset(next[0]),
  };
}

export function isOpenAfter(rows: readonly HoursRow[], dayOfWeek: number, clock: string): boolean {
  const minute = dayOfWeek * MINUTES_PER_DAY + toMinutes(clock);
  return weeklyIntervals(rows).some(([start, end]) => start <= minute && minute < end);
}
