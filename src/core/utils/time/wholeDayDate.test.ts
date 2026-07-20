import { describe, expect, it } from 'vitest';
import { fromWholeDayWire, toWholeDayWire, wholeDaySpanMinutes } from './wholeDayDate';

describe('wholeDaySpanMinutes', () => {
  it('is 0 for a single-day span', () => {
    expect(wholeDaySpanMinutes(new Date(2026, 6, 20), new Date(2026, 6, 20))).toBe(0);
  });

  it('is (days × 1440) for a multi-day span', () => {
    expect(wholeDaySpanMinutes(new Date(2026, 6, 20), new Date(2026, 6, 22))).toBe(2 * 24 * 60);
  });

  it('ignores time-of-day (calendar days only)', () => {
    expect(wholeDaySpanMinutes(new Date(2026, 6, 20, 10), new Date(2026, 6, 20, 23))).toBe(0);
  });

  it('is 0 (never negative) when the end is before the start', () => {
    expect(wholeDaySpanMinutes(new Date(2026, 6, 22), new Date(2026, 6, 20))).toBe(0);
  });

  it('is 0 when a date is missing', () => {
    expect(wholeDaySpanMinutes(undefined, new Date(2026, 6, 20))).toBe(0);
    expect(wholeDaySpanMinutes(new Date(2026, 6, 20), undefined)).toBe(0);
  });
});

// A whole-day event is a bare calendar date. Its canonical wire/storage value is
// UTC-midnight of that date, so it reads the same day for every timezone. These
// assertions hold under ANY process TZ (run the file under TZ=UTC / Amsterdam /
// Sofia / America/Los_Angeles to confirm) — they are TZ-independent by construction.

describe('toWholeDayWire', () => {
  it('anchors a locally-picked whole-day date to UTC-midnight of that calendar day', () => {
    // The form supplies local midnight of the picked day (date-fns startOfDay);
    // its local Y-M-D is the date the user chose, regardless of browser offset.
    const pickedLocalMidnight = new Date(2026, 11, 3); // 3 Dec 2026, local
    expect(toWholeDayWire(pickedLocalMidnight).toISOString()).toBe('2026-12-03T00:00:00.000Z');
  });

  it('uses only the calendar date, ignoring any local time-of-day', () => {
    const pickedWithTime = new Date(2026, 11, 3, 14, 30, 15);
    expect(toWholeDayWire(pickedWithTime).toISOString()).toBe('2026-12-03T00:00:00.000Z');
  });

  it('handles a month boundary', () => {
    expect(toWholeDayWire(new Date(2026, 11, 31)).toISOString()).toBe('2026-12-31T00:00:00.000Z');
  });
});

describe('fromWholeDayWire', () => {
  it('reads stored UTC-midnight as a local floating date on the same calendar day', () => {
    const d = fromWholeDayWire('2026-12-03T00:00:00.000Z');
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 11, 3]);
    expect([d.getHours(), d.getMinutes(), d.getSeconds()]).toEqual([0, 0, 0]);
  });

  it('accepts a Date as well as an ISO string', () => {
    const d = fromWholeDayWire(new Date('2026-12-03T00:00:00.000Z'));
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 11, 3]);
  });

  it('round-trips with toWholeDayWire for any picked local date', () => {
    const local = new Date(2026, 11, 3, 9, 41);
    const back = fromWholeDayWire(toWholeDayWire(local));
    expect([back.getFullYear(), back.getMonth(), back.getDate()]).toEqual([2026, 11, 3]);
  });
});
