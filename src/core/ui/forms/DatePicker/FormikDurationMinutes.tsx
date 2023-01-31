import React from 'react';
import { useField } from 'formik';
import { FormikInputProps } from '../FormikInputProps';
import { addMinutes } from '../../../utils/time/utils';
import NativeTimePicker, { NativeTimePickerProps } from './NativeTimePicker';

type FormikTimePickerProps = FormikInputProps &
  NativeTimePickerProps & {
    dateFieldName: string;
  };

const MILLISECONDS_IN_MINUTE = 60 * 1000;

const FormikDurationMinutes = ({ name, dateFieldName, ...datePickerProps }: FormikTimePickerProps) => {
  const [field, , helpers] = useField<number>(name);
  const [dateField] = useField<Date | string>(dateFieldName);

  const handleChange = (endDate: Date) => {
    const startDate = new Date(dateField.value);

    const durationMinutes = (endDate.valueOf() - startDate.valueOf()) / MILLISECONDS_IN_MINUTE;

    helpers.setValue(durationMinutes);
  };

  const date = addMinutes(dateField.value, field.value);

  return <NativeTimePicker value={date} onChange={handleChange} fullWidth {...datePickerProps} />;
};

export default FormikDurationMinutes;
