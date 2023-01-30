import React, { useState } from 'react';
import { useField } from 'formik';
import { FormikInputProps } from '../FormikInputProps';
import { LocalizationProvider, TimePicker, TimePickerProps } from '@mui/lab';
import { TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addMinutes } from '../../../utils/time/utils';

interface FormikTimePickerProps extends FormikInputProps, Partial<TimePickerProps> {
  dateFieldName: string;
}

const MILLISECONDS_IN_MINUTE = 60 * 1000;

const FormikDurationMinutes = ({ name, dateFieldName, ...datePickerProps }: FormikTimePickerProps) => {
  const [field, , helpers] = useField<number>(name);
  const [dateField] = useField<Date | string>(dateFieldName);

  const [isOpen, setIsOpen] = useState(false);

  const handleChange: TimePickerProps['onChange'] = date => {
    const endDate = new Date(date as string);
    const startDate = new Date(dateField.value);

    const durationMinutes = (endDate.valueOf() - startDate.valueOf()) / MILLISECONDS_IN_MINUTE;

    helpers.setValue(durationMinutes);
  };

  const date = addMinutes(dateField.value, field.value);

  // TODO consider uncontrolled state (no open/onOpen/onClose)
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TimePicker
        open={isOpen}
        value={date}
        onChange={handleChange}
        renderInput={params => <TextField {...params} fullWidth />}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        minTime={new Date(dateField.value)}
        {...datePickerProps}
      />
    </LocalizationProvider>
  );
};

export default FormikDurationMinutes;
