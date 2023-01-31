import React, { useState } from 'react';
import { TextField } from '@mui/material';
import { LocalizationProvider, TimePicker, TimePickerProps } from '@mui/lab';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export interface AlkemioTimePickerProps extends Omit<TimePickerProps<Date>, 'renderInput'> {
  fullWidth?: boolean;
}

const AlkemioTimePicker = ({ fullWidth, ...datePickerProps }: AlkemioTimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // TODO consider uncontrolled state (no open/onOpen/onClose)
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TimePicker
        open={isOpen}
        renderInput={params => <TextField {...params} fullWidth={fullWidth} />}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        ampm={false}
        {...datePickerProps}
      />
    </LocalizationProvider>
  );
};

export default AlkemioTimePicker;
