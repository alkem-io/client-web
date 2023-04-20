import React, { ReactNode } from 'react';
import { Stack, Switch } from '@mui/material';
import { Caption } from '../../typography';

interface AltToggleOption<Value> {
  label: ReactNode;
  value: Value;
}

interface TwoSideToggleProps<Value1, Value2> {
  value: Value1 | Value2;
  options: AltToggleOption<Value1 | Value2>[]; // [AltToggleOption<Value1>, AltToggleOption<Value2>] is harder to pass
  onChange: (nextValue: Value1 | Value2) => void;
}

const AltToggle = <Value1, Value2>({ value, options, onChange }: TwoSideToggleProps<Value1, Value2>) => {
  const [leftOption, rightOption] = options;

  const isLeftOptionSelected = value === leftOption.value;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, isChecked: boolean) => {
    onChange(isChecked ? rightOption.value : leftOption.value);
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        '.MuiSwitch-track': {
          backgroundColor: theme => theme.palette.secondary.main,
        },
        '.Mui-checked+.MuiSwitch-track': {
          backgroundColor: theme => theme.palette.secondary.main,
        },
        '.MuiSwitch-thumb': {
          backgroundColor: theme => theme.palette.primary.main,
        },
      }}
    >
      <Caption>{leftOption.label}</Caption>
      <Switch checked={!isLeftOptionSelected} onChange={handleChange} />
      <Caption>{rightOption.label}</Caption>
    </Stack>
  );
};

export default AltToggle;
