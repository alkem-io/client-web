import React from 'react';
import { FormControl, FormLabel, FormHelperText, FormControlProps } from '@mui/material';

export interface FormFieldProps extends FormControlProps {
  label?: string;
  helperText?: string;
  error?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, helperText, error, children, ...props }) => {
  return (
    <FormControl error={error} {...props}>
      {label && <FormLabel>{label}</FormLabel>}
      {children}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};
