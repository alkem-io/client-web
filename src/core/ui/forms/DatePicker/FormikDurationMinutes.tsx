import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { useField } from 'formik';
import { FormikInputProps } from '../FormikInputProps';
import { addMinutes } from '../../../utils/time/utils';
import AlkemioTimePicker, { AlkemioTimePickerProps } from './AlkemioTimePicker';
import dayjs from 'dayjs';
import { useValidationMessageTranslation } from '@/domain/shared/i18n/ValidationMessageTranslation';
import TranslationKey from '../../../i18n/utils/TranslationKey';

interface FormikTimePickerProps extends FormikInputProps, Omit<AlkemioTimePickerProps, 'value' | 'onChange'> {
  startTimeFieldName: string;
}

const MILLISECONDS_IN_MINUTE = 60 * 1000;

const FormikDurationMinutes = ({ name, startTimeFieldName, ...datePickerProps }: FormikTimePickerProps) => {
  const [field, meta, helpers] = useField<number>(name);
  const [startTimeField] = useField<Date | string>(startTimeFieldName);

  const tErr = useValidationMessageTranslation();

  const isError = Boolean(meta.error) && meta.touched;

  const helperText = useMemo(() => {
    if (!isError) {
      return;
    }
    return tErr(meta.error as TranslationKey, { field: datePickerProps.label as string });
  }, [isError, meta.error, tErr, datePickerProps.label]);

  const handleChange = (endDate: Date) => {
    const startDate = new Date(startTimeField.value);

    const durationMinutes = (endDate.valueOf() - startDate.valueOf()) / MILLISECONDS_IN_MINUTE;

    helpers.setValue(durationMinutes);
  };

  const oldStartTimeRef = useRef(new Date(startTimeField.value));

  const updateDurationMinutes = () => {
    // Normally we keep durationMinutes when startTime changes, except for the case when
    // startTime was after endTime (negative durationMinutes) but then it got changed
    // to be before endTime (valid combination).
    // In this case we keep endTime intact by increasing durationMinutes by the difference
    // between old startTime and new startTime.
    const startTime = new Date(startTimeField.value);
    const isStartTimeValid = !isNaN(startTime.getTime());

    if (field.value < 0 && isStartTimeValid) {
      const durationMinutes =
        (addMinutes(oldStartTimeRef.current, field.value).getTime() - startTime.getTime()) / MILLISECONDS_IN_MINUTE;
      helpers.setValue(durationMinutes);
    }

    if (isStartTimeValid) {
      oldStartTimeRef.current = startTime;
    }
  };

  useLayoutEffect(() => {
    updateDurationMinutes();
  }, []);

  useLayoutEffect(() => {
    updateDurationMinutes();
  }, [startTimeField.value]);

  const date = addMinutes(startTimeField.value, field.value);

  return (
    <AlkemioTimePicker
      value={date}
      onChange={handleChange}
      error={helperText}
      onBlur={() => helpers.setTouched(true)}
      minTime={dayjs(startTimeField.value)}
      fullWidth
      {...datePickerProps}
    />
  );
};

export default FormikDurationMinutes;
