import { isSameDay } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import type { EventFormValues } from '../dataMappers/calendarEventDataMapper';

export type EventFormErrors = Partial<Record<keyof EventFormValues, string>>;

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
    durationMinutes: 30,
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
    setValues(prev => ({ ...prev, [key]: value }));
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

    // Duration/end validity — mirrors MUI validateDuration:
    //   valid when wholeDay || (sameDay && durationMinutes > 0) || endDate > startDate
    if (!values.wholeDay) {
      const { startDate, endDate, durationMinutes } = values;
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
