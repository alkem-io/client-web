import { describe, expect, it } from 'vitest';
import { CalendarEventType } from '@/core/apollo/generated/graphql-schema';
import type { EventFormValues } from '../dataMappers/calendarEventDataMapper';
import { toDomainPayload } from './useCrdEventFormDialog';

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
