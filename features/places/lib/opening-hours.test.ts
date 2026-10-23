import { describe, expect, it } from 'vitest';
import { getOpenStatus, isOpenAfter, localMinuteOfWeek, type HoursRow } from './opening-hours';

const tz = 'Asia/Kolkata';
const ist = (iso: string) => new Date(`${iso}+05:30`);
const everyDay = (opensAt: string, closesAt: string): HoursRow[] =>
  Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, opensAt, closesAt }));

describe('localMinuteOfWeek', () => {
  it('uses the restaurant time zone, not the server', () => {
    expect(localMinuteOfWeek(new Date('2026-10-19T18:45:00Z'), tz)).toBe(2 * 1440 + 15);
  });
});

describe('getOpenStatus', () => {
  it('reports open with closing time', () => {
    expect(getOpenStatus(everyDay('11:30:00', '23:30:00'), ist('2026-10-21T20:00:00'), tz)).toEqual({
      state: 'open',
      closesAt: '23:30',
      closesInMinutes: 210,
      nextDayOffset: 0,
    });
  });

  it('reports closed with next opening later today', () => {
    expect(getOpenStatus(everyDay('11:30:00', '23:30:00'), ist('2026-10-21T09:00:00'), tz)).toMatchObject({
      state: 'closed',
      opensAt: '11:30',
      nextDayOffset: 0,
    });
  });

  it('handles overnight hours past midnight', () => {
    const status = getOpenStatus(everyDay('18:00:00', '02:00:00'), ist('2026-10-22T01:00:00'), tz);
    expect(status).toEqual({ state: 'open', closesAt: '02:00', closesInMinutes: 60, nextDayOffset: 0 });
  });

  it('merges split shifts and finds the evening opening', () => {
    const rows = [...everyDay('06:30:00', '11:30:00'), ...everyDay('16:30:00', '21:30:00')];
    expect(getOpenStatus(rows, ist('2026-10-21T13:00:00'), tz)).toMatchObject({
      state: 'closed',
      opensAt: '16:30',
    });
  });

  it('wraps from Saturday night to Sunday opening', () => {
    const rows: HoursRow[] = [{ dayOfWeek: 0, opensAt: '08:00:00', closesAt: '12:00:00' }];
    expect(getOpenStatus(rows, ist('2026-10-24T22:00:00'), tz)).toMatchObject({
      state: 'closed',
      opensAt: '08:00',
      nextDayOffset: 1,
    });
  });

  it('treats a 24-hour day as open across midnight', () => {
    const status = getOpenStatus(everyDay('00:00:00', '00:00:00'), ist('2026-10-21T23:59:00'), tz);
    expect(status.state).toBe('open');
  });

  it('returns unknown when hours are missing', () => {
    expect(getOpenStatus([], new Date(), tz)).toEqual({ state: 'unknown' });
  });
});

describe('isOpenAfter', () => {
  it('detects late-night opening', () => {
    expect(isOpenAfter(everyDay('18:00:00', '02:00:00'), 3, '23:30')).toBe(true);
    expect(isOpenAfter(everyDay('11:30:00', '23:00:00'), 3, '23:30')).toBe(false);
  });
});
