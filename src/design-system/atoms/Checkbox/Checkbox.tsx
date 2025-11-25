import React from 'react';
import { Checkbox as MuiCheckbox, CheckboxProps as MuiCheckboxProps, FormControlLabel } from '@mui/material';

export interface CheckboxProps extends MuiCheckboxProps {
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, ...props }) => {
  if (label) {
    return <FormControlLabel control={<MuiCheckbox {...props} />} label={label} />;
  }
  return <MuiCheckbox {...props} />;
};
