import React from 'react';
import { useField } from 'formik';
import { FormikInputProps } from '../FormikInputProps';
import NativeTimePicker, { NativeTimePickerProps } from './NativeTimePicker';

type FormikTimePickerProps = FormikInputProps &
  NativeTimePickerProps & {
    step?: number;
  };

const FormikTimePicker = ({ name, ...datePickerProps }: FormikTimePickerProps) => {
  const [field, , helpers] = useField<Date | string>(name);

  return <NativeTimePicker value={field.value} onChange={helpers.setValue} fullWidth {...datePickerProps} />;
};

export default FormikTimePicker;
