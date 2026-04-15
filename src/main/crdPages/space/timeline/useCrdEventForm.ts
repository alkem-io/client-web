import { isSameDay } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import type { EventFormValues } from '../dataMappers/calendarEventDataMapper';

export type EventFormErrors = Partial<Record<keyof EventFormValues, string>>;

const defaultValues: EventFormValues = {
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

export type UseCrdEventFormResult = {
  values: EventFormValues;
  errors: EventFormErrors;
  setField: <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) => void;
  /** Validates current state; sets `errors` as a side-effect and returns true when clean. */
  validate: () => boolean;
  reset: () => void;
  prefill: (partial: Partial<EventFormValues>) => void;
};

/**
 * Controlled form state for the calendar create/edit dialog. Mirrors the
 * pattern established by `useCrdCalloutForm.ts` — useState + direct checks
 * (not Formik). Validation rules match the MUI CalendarEventForm schema
 * (src/domain/timeline/calendar/views/CalendarEventForm.tsx:109-136).
 */
export function useCrdEventForm(initialValues?: Partial<EventFormValues>): UseCrdEventFormResult {
  const { t } = useTranslation('crd-space');
  const [values, setValues] = useState<EventFormValues>({ ...defaultValues, ...initialValues });
  const [errors, setErrors] = useState<EventFormErrors>({});

  const setField = <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
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

  const reset = () => {
    setValues(defaultValues);
    setErrors({});
  };

  const prefill = (partial: Partial<EventFormValues>) => {
    setValues(prev => ({ ...prev, ...partial }));
    setErrors({});
  };

  return { values, errors, setField, validate, reset, prefill };
}
