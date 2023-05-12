import React, { ReactNode, useMemo } from 'react';
import { Box, BoxProps, MenuItem, Select, SelectProps, styled } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import ScheduleIcon from '@mui/icons-material/Schedule';

export interface AlkemioTimePickerProps
  extends Omit<SelectProps<string>, 'name' | 'value' | 'renderInput' | 'onChange' | 'error'> {
  value: Date | string;
  fullWidth?: boolean;
  onChange?: (date: Date) => void;
  onBlur?: () => void;
  minTime?: Dayjs;
  error?: ReactNode;
  containerProps?: BoxProps;
}

const Styles = styled(Box)(() => ({
  // Fix weird bug that hides the legend on select boxes:
  legend: { height: 15 },
  'legend > span': { opacity: 1 },
  // Disable combo box icon (normally the arrow down) rotation
  '.MuiSvgIcon-root': {
    transform: 'none !important',
  },
}));

const AlkemioTimePicker = ({
  value,
  onChange,
  error,
  fullWidth,
  onBlur,
  minTime,
  containerProps,
  ...timePickerProps
}: AlkemioTimePickerProps) => {
  const handleChange = (date: string | null) => {
    date && onChange?.(dayjs(date).toDate());
  };

  const djsDate = useMemo(() => dayjs(value).startOf('day'), [value]);

  const timeSlots = useMemo(
    () => [...Array(24).keys()].flatMap(h => [djsDate.set('hour', h), djsDate.set('hour', h).set('minute', 30)]),
    [djsDate]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Styles {...containerProps}>
        <Select
          value={dayjs(value).format()}
          onChange={event => handleChange(event.target.value)}
          IconComponent={ScheduleIcon}
          fullWidth
          notched
          {...timePickerProps}
        >
          {timeSlots.map(t => (
            <MenuItem value={t.format()} disabled={t.isBefore(minTime)}>
              {t.format('HH:mm')}
            </MenuItem>
          ))}
        </Select>
      </Styles>
    </LocalizationProvider>
  );
};

export default AlkemioTimePicker;
