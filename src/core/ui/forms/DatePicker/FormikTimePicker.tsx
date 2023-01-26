import React, { useState } from 'react';
import { useField } from 'formik';
import { FormikInputProps } from '../FormikInputProps';
import { LocalizationProvider, TimePicker, TimePickerProps } from '@mui/lab';
import { TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface FormikTimePickerProps extends FormikInputProps, Partial<TimePickerProps> {}

const FormikDatePicker = ({ name, ...datePickerProps }: FormikTimePickerProps) => {
  const [field, , helpers] = useField(name);

  const [isOpen, setIsOpen] = useState(false);

  const handleChange: TimePickerProps['onChange'] = (date) => {
    helpers.setValue(date);
    setIsOpen(false);
  };

  // TODO consider uncontrolled state (no open/onOpen/onClose)
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TimePicker open={isOpen} value={field.value} onChange={handleChange} renderInput={(params) => <TextField {...params} fullWidth />} onOpen={() => setIsOpen(true)} onClose={() => setIsOpen(false)} {...datePickerProps} />
    </LocalizationProvider>
  );
};

export default FormikDatePicker;
