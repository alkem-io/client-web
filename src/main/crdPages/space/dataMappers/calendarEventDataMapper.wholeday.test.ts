import { describe, expect, it } from 'vitest';
import { type CalendarEventInfoFragment, CalendarEventType } from '@/core/apollo/generated/graphql-schema';
import { mapCalendarEventInfoToListItem, mapCalendarEventInfoToSidebarItem } from './calendarEventDataMapper';

// Run under a west-of-UTC viewer (TZ=America/Los_Angeles) to prove the whole-day
// date does not slip a day: `new Date('…T00:00:00Z')` renders as the previous
// local day there, so the mapper must anchor whole-day dates as floating dates.
const infoFragment = (over: Record<string, unknown>): CalendarEventInfoFragment =>
  ({
    id: 'e1',
    startDate: '2026-12-03T00:00:00.000Z',
    wholeDay: true,
    durationMinutes: 1440,
    durationDays: 1,
    type: CalendarEventType.Event,
    profile: { id: 'p1', displayName: 'Hackathon', description: '', url: '/x', tagset: { id: 't', tags: [] } },
    subspace: undefined,
    ...over,
  }) as unknown as CalendarEventInfoFragment;

const ymd = (d: Date | undefined) => d && [d.getFullYear(), d.getMonth(), d.getDate()];

describe('calendarEventDataMapper — whole-day dates are viewer-timezone-independent', () => {
  it('maps a whole-day list-item start to the picked calendar day', () => {
    expect(ymd(mapCalendarEventInfoToListItem(infoFragment({})).startDate)).toEqual([2026, 11, 3]);
  });

  it('maps a whole-day sidebar-item start to the picked calendar day', () => {
    expect(ymd(mapCalendarEventInfoToSidebarItem(infoFragment({})).startDate)).toEqual([2026, 11, 3]);
  });

  it('leaves a timed event start as the real instant', () => {
    const item = mapCalendarEventInfoToListItem(
      infoFragment({ wholeDay: false, startDate: '2026-12-03T14:00:00.000Z' })
    );
    expect(item.startDate?.getTime()).toBe(new Date('2026-12-03T14:00:00.000Z').getTime());
  });
});
