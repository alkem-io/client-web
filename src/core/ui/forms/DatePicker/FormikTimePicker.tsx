import React from 'react';
import { useField } from 'formik';
import { FormikInputProps } from '../FormikInputProps';
import AlkemioTimePicker, { AlkemioTimePickerProps } from './AlkemioTimePicker';

interface FormikTimePickerProps extends FormikInputProps, Omit<AlkemioTimePickerProps, 'value' | 'onChange'> {}

const FormikTimePicker = ({ name, ...datePickerProps }: FormikTimePickerProps) => {
  const [field, , helpers] = useField<Date | string>(name);

  const handleChange = (date: Date | null) => {
    date && helpers.setValue(date);
  };

  return <AlkemioTimePicker value={field.value} onChange={handleChange} fullWidth {...datePickerProps} />;
};

export default FormikTimePicker;
