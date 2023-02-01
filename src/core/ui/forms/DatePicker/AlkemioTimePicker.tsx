import React, { ReactNode, useState } from 'react';
import { TextField } from '@mui/material';
import { LocalizationProvider, TimePicker, TimePickerProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import ToggleableTooltip from '../../tooltip/ToggleableTooltip';

export interface AlkemioTimePickerProps
  extends Omit<TimePickerProps<Dayjs, Dayjs>, 'value' | 'renderInput' | 'onChange'> {
  value: Date | string;
  fullWidth?: boolean;
  onChange?: (date: Date) => void;
  onBlur?: () => void;
  error?: ReactNode;
}

const AlkemioTimePicker = ({
  value,
  onChange,
  error,
  fullWidth,
  onBlur,
  ...datePickerProps
}: AlkemioTimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (date: Dayjs | null) => {
    date && onChange?.(date.toDate());
  };

  // TODO consider uncontrolled state (no open/onOpen/onClose)
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        value={dayjs(value)}
        onChange={handleChange}
        open={isOpen}
        renderInput={params => (
          <ToggleableTooltip title={error!} disabled={!error}>
            <TextField {...params} onBlur={onBlur} error={Boolean(error)} fullWidth={fullWidth} />
          </ToggleableTooltip>
        )}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        ampm={false}
        {...datePickerProps}
      />
    </LocalizationProvider>
  );
};

export default AlkemioTimePicker;
