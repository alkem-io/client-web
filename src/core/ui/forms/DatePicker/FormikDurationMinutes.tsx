import React from 'react';
import { useField } from 'formik';
import { FormikInputProps } from '../FormikInputProps';
import { addMinutes } from '../../../utils/time/utils';
import AlkemioTimePicker, { AlkemioTimePickerProps } from './AlkemioTimePicker';

interface FormikTimePickerProps extends FormikInputProps, Omit<AlkemioTimePickerProps, 'value' | 'onChange'> {
  dateFieldName: string;
}

const MILLISECONDS_IN_MINUTE = 60 * 1000;

const FormikDurationMinutes = ({ name, dateFieldName, ...datePickerProps }: FormikTimePickerProps) => {
  const [field, , helpers] = useField<number>(name);
  const [dateField] = useField<Date | string>(dateFieldName);

  const handleChange = (endDate: Date | null) => {
    if (!endDate) {
      return;
    }

    const startDate = new Date(dateField.value);

    const durationMinutes = (endDate.valueOf() - startDate.valueOf()) / MILLISECONDS_IN_MINUTE;

    helpers.setValue(durationMinutes);
  };

  const date = addMinutes(dateField.value, field.value);

  return <AlkemioTimePicker value={date} onChange={handleChange} fullWidth {...datePickerProps} />;
};

export default FormikDurationMinutes;
