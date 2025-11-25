import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export interface InputProps
  extends Pick<TextFieldProps, 'label' | 'value' | 'onChange' | 'fullWidth' | 'placeholder' | 'type'> {}

export const Input: React.FC<InputProps> = props => {
  return <TextField variant="outlined" {...props} />;
};
