import { describe, expect, it } from 'vitest';
import { type CalendarEventInfoFragment, CalendarEventType } from '@/core/apollo/generated/graphql-schema';
import type { EventFormValues } from '../dataMappers/calendarEventDataMapper';
import { buildEditInitialValues, toDomainPayload } from './useCrdEventFormDialog';

const infoFragment = (over: Record<string, unknown>): CalendarEventInfoFragment =>
  ({
    id: 'e1',
    startDate: '2026-12-03T00:00:00.000Z',
    wholeDay: true,
    durationMinutes: 1440,
    durationDays: 1,
    type: CalendarEventType.Event,
    visibleOnParentCalendar: true,
    profile: { id: 'p1', displayName: 'Hackathon', description: '', url: '/x', tagset: { id: 't', tags: [] } },
    subspace: undefined,
    ...over,
  }) as unknown as CalendarEventInfoFragment;

const ymd = (d: Date | undefined) => d && [d.getFullYear(), d.getMonth(), d.getDate()];

const baseValues = (overrides: Partial<EventFormValues>): EventFormValues => ({
  displayName: 'Hackathon',
  type: CalendarEventType.Event,
  startDate: undefined,
  endDate: undefined,
  wholeDay: false,
  durationMinutes: 60,
  description: '',
  locationCity: '',
  tags: [],
  visibleOnParentCalendar: true,
  ...overrides,
});

describe('toDomainPayload — whole-day anchoring', () => {
  it('sends a whole-day start/end as UTC-midnight of the picked calendar day', () => {
    // The form supplies local midnight (date-fns startOfDay) of the picked days.
    const values = baseValues({
      wholeDay: true,
      startDate: new Date(2026, 11, 3), // 3 Dec 2026, local midnight
      endDate: new Date(2026, 11, 4), // 4 Dec 2026, local midnight
    });

    const payload = toDomainPayload(values);
    if (!payload?.startDate) throw new Error('expected a payload with a start date');

    expect(new Date(payload.startDate).toISOString()).toBe('2026-12-03T00:00:00.000Z');
    expect(new Date(payload.endDate).toISOString()).toBe('2026-12-04T00:00:00.000Z');
  });

  it('gives a whole-day multi-day span an exact whole-day duration (DST-safe)', () => {
    const values = baseValues({
      wholeDay: true,
      startDate: new Date(2026, 11, 3),
      endDate: new Date(2026, 11, 5), // two days later
    });

    const payload = toDomainPayload(values);
    if (!payload) throw new Error('expected a payload');

    expect(payload.durationMinutes % 1440).toBe(0);
    expect(payload.durationDays).toBe(2);
  });

  it('leaves a timed event unchanged (real instant, no anchoring)', () => {
    const start = new Date(2026, 11, 3, 14, 0);
    const values = baseValues({
      wholeDay: false,
      startDate: start,
      endDate: new Date(2026, 11, 3, 15, 0),
    });

    const payload = toDomainPayload(values);
    if (!payload?.startDate) throw new Error('expected a payload with a start date');

    expect(new Date(payload.startDate).getTime()).toBe(start.getTime());
    expect(payload.wholeDay).toBe(false);
  });
});

describe('buildEditInitialValues — whole-day edit round-trip', () => {
  it('seeds the edit form with the picked calendar days for any viewer timezone', () => {
    // Stored whole-day: 3 Dec → 4 Dec (durationMinutes 1440 = 1 day).
    const seed = buildEditInitialValues(infoFragment({}));

    expect(ymd(seed.startDate)).toEqual([2026, 11, 3]);
    expect(ymd(seed.endDate)).toEqual([2026, 11, 4]);
  });

  it('seeds a DST-crossing multi-day whole-day span with the exact calendar days', () => {
    // Europe spring-forward 2026 is 29 March; a whole-day 28–30 March span
    // (durationMinutes 2880 = 2 days). The end is derived from the UTC instant,
    // so it does not drift across the DST transition.
    const seed = buildEditInitialValues(
      infoFragment({ startDate: '2026-03-28T00:00:00.000Z', durationMinutes: 2880, durationDays: 2 })
    );

    expect(ymd(seed.startDate)).toEqual([2026, 2, 28]);
    expect(ymd(seed.endDate)).toEqual([2026, 2, 30]);
  });

  it('round-trips: a stored whole-day date survives edit-seed → re-save unchanged', () => {
    const seed = buildEditInitialValues(infoFragment({}));
    const full: EventFormValues = {
      displayName: 'Hackathon',
      type: CalendarEventType.Event,
      wholeDay: true,
      durationMinutes: 1440,
      description: '',
      locationCity: '',
      tags: [],
      visibleOnParentCalendar: true,
      startDate: undefined,
      endDate: undefined,
      ...seed,
    };

    const payload = toDomainPayload(full);
    if (!payload?.startDate) throw new Error('expected a payload with a start date');

    expect(new Date(payload.startDate).toISOString()).toBe('2026-12-03T00:00:00.000Z');
  });
});
