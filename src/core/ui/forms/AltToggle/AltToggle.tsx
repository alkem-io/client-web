import { ReactNode, ChangeEvent } from 'react';
import { Stack, StackProps, Switch } from '@mui/material';
import { Caption } from '@/core/ui/typography';

type AltToggleOption<Value> = {
  label: ReactNode;
  value: Value;
};

interface AltToggleProps<Value1, Value2> {
  value: Value1 | Value2;
  options: AltToggleOption<Value1 | Value2>[]; // [AltToggleOption<Value1>, AltToggleOption<Value2>] is harder to pass
  onChange: (nextValue: Value1 | Value2) => void;
}

const AltToggle = <Value1, Value2>({
  value,
  options,
  onChange,
  sx,
  'aria-label': ariaLabel,
  ...stackProps
}: AltToggleProps<Value1, Value2> & Omit<StackProps, 'onChange'>) => {
  const [leftOption, rightOption] = options;

  const isLeftOptionSelected = value === leftOption.value;

  const handleChange = (event: ChangeEvent<HTMLInputElement>, isChecked: boolean) => {
    onChange(isChecked ? rightOption.value : leftOption.value);
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        '.MuiSwitch-track': {
          backgroundColor: theme => theme.palette.primary.main,
          opacity: 0.5,
        },
        '.MuiSwitch-thumb': {
          backgroundColor: theme => theme.palette.primary.main,
        },
        ...sx,
      }}
      {...stackProps}
    >
      <Caption>{leftOption.label}</Caption>
      <Switch
        checked={!isLeftOptionSelected}
        onChange={handleChange}
        inputProps={{
          'aria-label': `${ariaLabel} ${leftOption.label} / ${rightOption.label}`,
        }}
      />
      <Caption>{rightOption.label}</Caption>
    </Stack>
  );
};

export default AltToggle;
