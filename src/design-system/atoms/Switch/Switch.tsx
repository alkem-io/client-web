import React from 'react';
import { Switch as MuiSwitch, SwitchProps as MuiSwitchProps, FormControlLabel } from '@mui/material';

export interface SwitchProps extends Omit<MuiSwitchProps, 'onChange'> {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({ label, checked, onChange, ...props }) => {
  const switchElement = <MuiSwitch checked={checked} onChange={e => onChange?.(e.target.checked)} {...props} />;

  if (label) {
    return <FormControlLabel control={switchElement} label={label} />;
  }

  return switchElement;
};
