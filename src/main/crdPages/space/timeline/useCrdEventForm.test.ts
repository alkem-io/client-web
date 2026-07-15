import { act, renderHook } from '@testing-library/react';
import { isSameDay } from 'date-fns';
import { describe, expect, it } from 'vitest';
import type { EventFormValues } from '../dataMappers/calendarEventDataMapper';
import { useCrdEventForm } from './useCrdEventForm';

// Seed the fields unrelated to the end/start rule so validate() isolates the
// duration/end checks (displayName + type are required independently).
const baseValues: Partial<EventFormValues> = {
  displayName: 'Team offsite',
  type: 'OTHER',
};

const runValidate = (values: Partial<EventFormValues>) => {
  const { result } = renderHook(() => useCrdEventForm({ ...baseValues, ...values }));
  let valid = false;
  act(() => {
    valid = result.current.validate();
  });
  return { valid, errors: result.current.errors };
};

describe('useCrdEventForm validation — end date vs start date', () => {
  describe('whole-day events', () => {
    it('rejects a whole-day event whose end date is before the start date', () => {
      const { valid, errors } = runValidate({
        wholeDay: true,
        startDate: new Date(2026, 6, 23),
        endDate: new Date(2026, 6, 22),
      });

      expect(valid).toBe(false);
      expect(errors.endDate).toBeTruthy();
    });

    it('accepts a single-day whole-day event (end day equals start day)', () => {
      const { valid, errors } = runValidate({
        wholeDay: true,
        startDate: new Date(2026, 6, 23, 9, 0),
        endDate: new Date(2026, 6, 23, 17, 0),
      });

      expect(valid).toBe(true);
      expect(errors.endDate).toBeFalsy();
    });

    it('accepts a multi-day whole-day event whose end day is after the start day', () => {
      const { valid, errors } = runValidate({
        wholeDay: true,
        startDate: new Date(2026, 6, 23),
        endDate: new Date(2026, 6, 25),
      });

      expect(valid).toBe(true);
      expect(errors.endDate).toBeFalsy();
    });
  });

  describe('timed events (regression — existing behaviour preserved)', () => {
    it('rejects a multi-day timed event whose end is before the start', () => {
      const { valid, errors } = runValidate({
        wholeDay: false,
        startDate: new Date(2026, 6, 25, 10, 0),
        endDate: new Date(2026, 6, 24, 10, 0),
      });

      expect(valid).toBe(false);
      expect(errors.endDate).toBeTruthy();
    });

    it('rejects a same-day timed event with non-positive duration', () => {
      const { valid, errors } = runValidate({
        wholeDay: false,
        startDate: new Date(2026, 6, 23, 10, 0),
        endDate: new Date(2026, 6, 23, 11, 0),
        durationMinutes: 0,
      });

      expect(valid).toBe(false);
      expect(errors.durationMinutes).toBeTruthy();
    });

    it('accepts a valid same-day timed event', () => {
      const { valid, errors } = runValidate({
        wholeDay: false,
        startDate: new Date(2026, 6, 23, 10, 0),
        endDate: new Date(2026, 6, 23, 11, 0),
        durationMinutes: 60,
      });

      expect(valid).toBe(true);
      expect(errors.endDate).toBeFalsy();
      expect(errors.durationMinutes).toBeFalsy();
    });
  });
});

describe('useCrdEventForm — start/end date coupling', () => {
  describe('changing the start date', () => {
    it('moves the end date to the new start day when both were on the same day (preserving end time)', () => {
      const { result } = renderHook(() =>
        useCrdEventForm({
          startDate: new Date(2026, 6, 23, 10, 0),
          endDate: new Date(2026, 6, 23, 14, 30),
        })
      );

      // react-day-picker returns the selected day at midnight.
      act(() => result.current.setField('startDate', new Date(2026, 6, 25, 0, 0)));

      const { startDate, endDate } = result.current.values;
      expect(isSameDay(startDate as Date, endDate as Date)).toBe(true);
      // End moved to the 25th but kept its 14:30 time-of-day.
      expect(endDate).toEqual(new Date(2026, 6, 25, 14, 30));
    });

    it('leaves the end date untouched when start and end were on different days', () => {
      const originalEnd = new Date(2026, 6, 25, 14, 0);
      const { result } = renderHook(() =>
        useCrdEventForm({
          startDate: new Date(2026, 6, 23, 10, 0),
          endDate: originalEnd,
        })
      );

      act(() => result.current.setField('startDate', new Date(2026, 6, 24, 0, 0)));

      expect(result.current.values.endDate).toEqual(originalEnd);
    });
  });

  describe('toggling "whole day"', () => {
    it('zeroes both times to midnight without shifting the day for a same-day event', () => {
      const { result } = renderHook(() =>
        useCrdEventForm({
          wholeDay: false,
          startDate: new Date(2026, 6, 23, 10, 0),
          endDate: new Date(2026, 6, 23, 14, 0),
        })
      );

      act(() => result.current.setField('wholeDay', true));

      expect(result.current.values.wholeDay).toBe(true);
      // Both times normalised to 12:00 AM; the day is NOT shifted — the end
      // date stays the last covered day (the exclusive +1 is applied at export).
      expect(result.current.values.startDate).toEqual(new Date(2026, 6, 23, 0, 0));
      expect(result.current.values.endDate).toEqual(new Date(2026, 6, 23, 0, 0));
    });

    it('zeroes the times but keeps the end day when start and end are on different days', () => {
      const { result } = renderHook(() =>
        useCrdEventForm({
          wholeDay: false,
          startDate: new Date(2026, 6, 23, 10, 0),
          endDate: new Date(2026, 6, 25, 14, 0),
        })
      );

      act(() => result.current.setField('wholeDay', true));

      expect(result.current.values.startDate).toEqual(new Date(2026, 6, 23, 0, 0));
      expect(result.current.values.endDate).toEqual(new Date(2026, 6, 25, 0, 0));
    });

    it('does not change dates when whole day is toggled off', () => {
      const originalEnd = new Date(2026, 6, 23, 14, 0);
      const { result } = renderHook(() =>
        useCrdEventForm({
          wholeDay: true,
          startDate: new Date(2026, 6, 23, 10, 0),
          endDate: originalEnd,
        })
      );

      act(() => result.current.setField('wholeDay', false));

      expect(result.current.values.endDate).toEqual(originalEnd);
    });
  });
});
