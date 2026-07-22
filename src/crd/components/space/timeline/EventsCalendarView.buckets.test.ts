import { describe, expect, it } from 'vitest';
import { buildBuckets } from './EventsCalendarView';

type Ev = Parameters<typeof buildBuckets>[0][number];

const event = (over: Partial<Ev>): Ev => ({
  id: 'e',
  title: '2-day event',
  // Local floating date, as the mapper now produces for whole-day events.
  startDate: new Date(2026, 6, 23), // 23 Jul 2026, local midnight
  durationMinutes: 2880, // full span = 2 days (server stores the whole span here)
  durationDays: 2,
  wholeDay: true,
  url: '/x',
  ...over,
});

const highlightedDays = (ev: Ev): number[] => {
  const { startDates, betweenDates, endDates } = buildBuckets([ev]);
  return [...startDates, ...betweenDates, ...endDates].map(d => d.getDate()).sort((a, b) => a - b);
};

describe('EventsCalendarView buildBuckets — no duration double-count', () => {
  it('highlights exactly the covered days of a multi-day whole-day event (not durationDays + durationMinutes)', () => {
    // 23 Jul + 2-day span → covers 23, 24, 25. The old code added durationDays (2)
    // on top of durationMinutes (2880 = 2 days) and lit up 23–27 (5 days).
    expect(highlightedDays(event({}))).toEqual([23, 24, 25]);
  });

  it('highlights a single day for a single-day whole-day event', () => {
    expect(highlightedDays(event({ durationMinutes: 0, durationDays: 0 }))).toEqual([23]);
  });
});
