import { DatePickerProps } from '@mui/lab';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useState } from 'react';
import { useField } from 'formik';
import { FormikInputProps } from '../FormikInputProps';

interface FormikDatePickerProps extends FormikInputProps, Partial<DatePickerProps<Date>> {}

const FormikDatePicker = ({ name, ...datePickerProps }: FormikDatePickerProps) => {
  const [field, , helpers] = useField(name);

  const [isOpen, setIsOpen] = useState(false);

  const handleChange: DatePickerProps<Date>['onChange'] = date => {
    helpers.setValue(date);
  };

  // TODO consider uncontrolled state (no open/onOpen/onClose)
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        open={isOpen}
        value={field.value}
        onChange={handleChange}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        format="dd/MM/yyyy"
        {...datePickerProps}
      />
    </LocalizationProvider>
  );
};

export default FormikDatePicker;
