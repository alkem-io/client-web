import ScheduleIcon from '@mui/icons-material/Schedule';
import { Box, type BoxProps, MenuItem, Select, type SelectProps, styled } from '@mui/material';
import dayjs, { type Dayjs } from 'dayjs';
import { times } from 'lodash-es';
import { gutters } from '@/core/ui/grid/utils';

export interface AlkemioTimePickerProps
  extends Omit<SelectProps<string>, 'name' | 'value' | 'renderInput' | 'onChange' | 'error'> {
  value: Date | string;
  fullWidth?: boolean;
  onChange?: (date: Date) => void;
  onBlur?: () => void;
  minTime?: Dayjs;
  error?: unknown;
  containerProps?: BoxProps;
}

const Styles = styled(Box)(() => ({
  // Fix weird bug that hides the legend on select boxes:
  legend: { height: 15 },
  'legend > span': { opacity: 1 },
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

  const djsDate = dayjs(value).startOf('day');

  const timeSlots = times(24).flatMap(h => [
    djsDate.set('hour', h).set('minute', 0),
    djsDate.set('hour', h).set('minute', 15),
    djsDate.set('hour', h).set('minute', 30),
    djsDate.set('hour', h).set('minute', 45),
  ]);

  return (
    <Styles {...containerProps}>
      <Select
        value={dayjs(value).format()}
        onChange={event => handleChange(event.target.value)}
        sx={{
          // Disable the rotation of the combobox icon (normally that small arrow down)
          '.MuiSvgIcon-root': {
            transform: 'none',
          },
        }}
        IconComponent={ScheduleIcon}
        MenuProps={{ sx: { '.MuiPaper-root': { maxHeight: gutters(12) } } }}
        fullWidth={true}
        notched={true}
        inputProps={{
          'aria-label': typeof timePickerProps.label === 'string' ? timePickerProps.label : undefined,
        }}
        {...timePickerProps}
      >
        {timeSlots.map(t => (
          <MenuItem key={t.format()} value={t.format()} disabled={t.isBefore(minTime)}>
            {t.format('HH:mm')}
          </MenuItem>
        ))}
      </Select>
    </Styles>
  );
};

export default AlkemioTimePicker;
