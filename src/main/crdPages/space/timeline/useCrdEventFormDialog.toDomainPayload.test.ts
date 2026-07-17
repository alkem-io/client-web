import { describe, expect, it } from 'vitest';
import { type CalendarEventInfoFragment, CalendarEventType } from '@/core/apollo/generated/graphql-schema';
import { deriveEventWireFields } from '@/domain/timeline/calendar/useCalendarEvents';
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

describe('toDomainPayload — raw mapping (anchoring is finalized at the mutation boundary)', () => {
  it('forwards the raw picked start/end unchanged (whole-day anchoring is deferred to deriveEventWireFields)', () => {
    const start = new Date(2026, 11, 3);
    const values = baseValues({ wholeDay: true, startDate: start, endDate: new Date(2026, 11, 4) });

    const payload = toDomainPayload(values);
    if (!payload?.startDate) throw new Error('expected a payload with a start date');

    expect(new Date(payload.startDate).getTime()).toBe(start.getTime());
    expect(payload.wholeDay).toBe(true);
  });

  it('returns undefined when required fields are missing', () => {
    expect(toDomainPayload(baseValues({ startDate: undefined }))).toBeUndefined();
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
    const full: EventFormValues = { ...baseValues({ wholeDay: true, durationMinutes: 1440 }), ...seed };

    const payload = toDomainPayload(full);
    if (!payload) throw new Error('expected a payload');

    // The boundary anchors on save — the stored UTC-midnight date is recovered.
    const wire = deriveEventWireFields({
      startDate: payload.startDate,
      endDate: payload.endDate,
      wholeDay: payload.wholeDay,
      durationMinutes: payload.durationMinutes,
    });
    expect(wire.startDate.toISOString()).toBe('2026-12-03T00:00:00.000Z');
  });
});
