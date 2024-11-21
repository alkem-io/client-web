import { useState } from 'react';
import { useField } from 'formik';
import { FormikInputProps } from '../FormikInputProps';
import { DatePicker, DatePickerProps, LocalizationProvider } from '@mui/lab';
import { TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface FormikDatePickerProps extends FormikInputProps, Partial<DatePickerProps> {}

const FormikDatePicker = ({ name, ...datePickerProps }: FormikDatePickerProps) => {
  const [field, , helpers] = useField(name);

  const [isOpen, setIsOpen] = useState(false);

  const handleChange: DatePickerProps['onChange'] = date => {
    helpers.setValue(date);
  };

  // TODO consider uncontrolled state (no open/onOpen/onClose)
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        open={isOpen}
        value={field.value}
        onChange={handleChange}
        renderInput={params => <TextField {...params} fullWidth />}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        inputFormat="dd/MM/yyyy"
        {...datePickerProps}
      />
    </LocalizationProvider>
  );
};

export default FormikDatePicker;
