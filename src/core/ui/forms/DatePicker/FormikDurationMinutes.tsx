import dayjs from 'dayjs';
import { useField } from 'formik';
import { useLayoutEffect, useRef } from 'react';
import { addMinutes } from '@/core/utils/time/utils';
import type { FormikInputProps } from '../FormikInputProps';
import AlkemioTimePicker, { type AlkemioTimePickerProps } from './AlkemioTimePicker';

interface FormikTimePickerProps extends FormikInputProps, Omit<AlkemioTimePickerProps, 'value' | 'onChange'> {
  startTimeFieldName: string;
}

const MILLISECONDS_IN_MINUTE = 60 * 1000;

const FormikDurationMinutes = ({
  name,
  startTimeFieldName,
  label,
  containerProps,
  disabled,
}: FormikTimePickerProps) => {
  const [field, , helpers] = useField<number>(name);
  const [startTimeField] = useField<Date | string>(startTimeFieldName);

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
    const isStartTimeValid = !Number.isNaN(startTime.getTime());

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
      minTime={dayjs(startTimeField.value)}
      fullWidth={true}
      label={label}
      containerProps={containerProps}
      disabled={disabled}
    />
  );
};

export default FormikDurationMinutes;
