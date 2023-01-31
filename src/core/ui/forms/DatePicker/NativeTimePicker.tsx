import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export type NativeTimePickerProps = Partial<Omit<TextFieldProps, 'value' | 'onChange'>> & {
  value?: Date | string;
  onChange?: (time: Date) => void;
  step?: number;
};

const DEFAULT_STEP_SECONDS = 5 * 60; // 5 minutes

const NativeTimePicker = ({
  value,
  onChange,
  step = DEFAULT_STEP_SECONDS,
  ...datePickerProps
}: NativeTimePickerProps) => {
  const handleChange: TextFieldProps['onChange'] = event => {
    if (!value) {
      return;
    }
    const [hours, minutes] = event.target.value.split(':');
    const nextDate = new Date(value);
    nextDate.setHours(parseInt(hours));
    nextDate.setMinutes(parseInt(minutes));
    onChange?.(nextDate);
  };

  const dateValue = typeof value === 'undefined' ? undefined : new Date(value);
  const stringValue = dateValue?.toLocaleTimeString() ?? '';

  return (
    <TextField
      value={stringValue}
      onChange={handleChange}
      type="time"
      InputLabelProps={{
        shrink: true,
      }}
      inputProps={{
        step,
      }}
      {...datePickerProps}
    />
  );
};

export default NativeTimePicker;
