import { isBefore, isSameDay, startOfDay } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import type { EventFormValues } from '../dataMappers/calendarEventDataMapper';

export type EventFormErrors = Partial<Record<keyof EventFormValues, string>>;

const DEFAULT_DURATION_MINUTES = 30;

/**
 * Whole-day span in minutes = (end day − start day). Zero for a single-day event.
 * A whole-day event has no time-of-day, so its duration is a pure function of the
 * date range — never an independent (stale) value.
 */
function wholeDaySpanMinutes(start: Date | undefined, end: Date | undefined): number {
  if (!start || !end) return 0;
  return Math.max(0, Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / 60_000));
}

/**
 * Builds a fresh defaults snapshot. Must be a factory rather than a
 * module-scope constant: otherwise startDate/endDate freeze to whenever the
 * module first loaded (page-load time). In a long-lived tab, opening the
 * dialog later would show a stale "now". The factory returns a new Date()
 * for each call so opening the form always reflects the current moment.
 */
function getDefaultValues(): EventFormValues {
  return {
    displayName: '',
    type: undefined,
    startDate: new Date(),
    endDate: new Date(),
    wholeDay: false,
    durationMinutes: DEFAULT_DURATION_MINUTES,
    description: '',
    locationCity: '',
    tags: [],
    visibleOnParentCalendar: false,
  };
}

export type UseCrdEventFormResult = {
  values: EventFormValues;
  errors: EventFormErrors;
  setField: <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) => void;
  /** Validates current state; sets `errors` as a side-effect and returns true when clean. */
  validate: () => boolean;
  /** Resets values to the defaults (NOT the initialValues passed at mount) and clears errors.
   *  Use it after a successful create / cancel to wipe the form for a fresh cycle. */
  clearForm: () => void;
};

/**
 * Controlled form state for the calendar create/edit dialog. Mirrors the
 * pattern established by `useCrdCalloutForm.ts` — useState + direct checks
 * (not Formik). Validation rules match the MUI CalendarEventForm schema
 * (src/domain/timeline/calendar/views/CalendarEventForm.tsx:109-136).
 *
 * `initialValues` seeds state once at mount via the lazy-init form of useState,
 * so subsequent renders do not stomp user edits. To reseed for a different
 * event, remount the consumer (e.g. pass a `key` prop tied to the event id).
 */
export function useCrdEventForm(initialValues?: Partial<EventFormValues>): UseCrdEventFormResult {
  const { t } = useTranslation('crd-space');
  const [values, setValues] = useState<EventFormValues>(() => ({ ...getDefaultValues(), ...initialValues }));
  const [errors, setErrors] = useState<EventFormErrors>({});

  // Date-related fields share the validateDuration rule (wholeDay, startDate,
  // endDate, durationMinutes), so editing one of them must also clear stale
  // errors on the others — otherwise toggling "Whole day" leaves the previous
  // "duration must be > 0" error visible until the user submits again.
  const DURATION_FIELDS: ReadonlyArray<keyof EventFormValues> = ['wholeDay', 'startDate', 'endDate', 'durationMinutes'];

  const setField = <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) => {
    setValues(prev => {
      const next = { ...prev, [key]: value };

      // Keep the end date coupled to the start date when the two were already on
      // the same calendar day: moving the start date carries the end date to the
      // same new day (the end date's time-of-day is preserved). If they were on
      // different days, the end date is left untouched.
      if (key === 'startDate') {
        const newStart = value as Date | undefined;
        if (newStart && prev.startDate && prev.endDate && isSameDay(prev.startDate, prev.endDate)) {
          const coupledEnd = new Date(prev.endDate);
          coupledEnd.setFullYear(newStart.getFullYear(), newStart.getMonth(), newStart.getDate());
          next.endDate = coupledEnd;
        }
      }

      // Turning on "whole day" normalises the times to midnight (12:00 AM) —
      // whole-day events carry a calendar date, not a time-of-day. The end date
      // is the last day the event covers (inclusive); the exclusive +1 day that
      // ICS/Google/Outlook need is added at export time, not stored here, so a
      // single-day whole-day event keeps the same start and end date. The duration
      // becomes a pure function of the date range (0 for a single day) — no stale
      // sub-day value survives (that is what the export/calendar actually use).
      if (key === 'wholeDay') {
        if (value === true) {
          if (prev.startDate) {
            next.startDate = startOfDay(prev.startDate);
          }
          if (prev.endDate) {
            next.endDate = startOfDay(prev.endDate);
          }
          next.durationMinutes = wholeDaySpanMinutes(next.startDate, next.endDate);
        } else {
          // Back to a timed event: reset to a sane sub-day default so a whole-day
          // span never leaks into the duration picker.
          next.durationMinutes = DEFAULT_DURATION_MINUTES;
        }
      }

      // Keep a whole-day event's duration in sync with its date range whenever a
      // date changes (the duration field is hidden for whole-day, so this is the
      // only thing that keeps it correct in the form).
      if ((key === 'startDate' || key === 'endDate') && next.wholeDay) {
        next.durationMinutes = wholeDaySpanMinutes(next.startDate, next.endDate);
      }

      return next;
    });
    setErrors(prev => {
      const next = { ...prev };
      // Always clear the edited field's own error.
      if (next[key]) next[key] = undefined;
      // If the edited field participates in the cross-field duration rule,
      // also clear errors on its siblings so the form doesn't carry stale
      // duration/end-before-start messages from a previous validate() pass.
      if (DURATION_FIELDS.includes(key)) {
        for (const sibling of DURATION_FIELDS) {
          if (sibling !== key && next[sibling]) next[sibling] = undefined;
        }
      }
      return next;
    });
  };

  const validate = (): boolean => {
    const nextErrors: EventFormErrors = {};

    if (!values.displayName.trim()) {
      nextErrors.displayName = t('calendar.validation.displayNameRequired');
    }

    if (!values.type) {
      nextErrors.type = t('calendar.validation.typeRequired');
    }

    if (values.description.length > MARKDOWN_TEXT_LENGTH) {
      nextErrors.description = t('calendar.validation.descriptionTooLong');
    }

    // Duration/end validity:
    //   whole-day → end day must not fall before the start day
    //   same-day (timed) → durationMinutes must be > 0
    //   multi-day (timed) → endDate must be after startDate
    // The end-before-start guard applies to whole-day events too: without it a
    // whole-day event whose end date precedes its start date is persisted with
    // a negative durationMinutes (see toDomainPayload's date-diff branch).
    const { startDate, endDate, durationMinutes } = values;

    if (values.wholeDay) {
      if (startDate && endDate && isBefore(startOfDay(endDate), startOfDay(startDate))) {
        nextErrors.endDate = t('calendar.validation.endBeforeStart');
      }
    } else {
      const sameDay = startDate && endDate && isSameDay(startDate, endDate);

      if (sameDay) {
        if (!durationMinutes || durationMinutes <= 0) {
          nextErrors.durationMinutes = t('calendar.validation.invalidDuration');
        }
      } else if (startDate && endDate && endDate.getTime() <= startDate.getTime()) {
        nextErrors.endDate = t('calendar.validation.endBeforeStart');
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const clearForm = () => {
    setValues(getDefaultValues());
    setErrors({});
  };

  return { values, errors, setField, validate, clearForm };
}
