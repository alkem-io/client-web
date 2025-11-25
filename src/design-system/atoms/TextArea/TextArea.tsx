import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export interface TextAreaProps extends Omit<TextFieldProps, 'variant' | 'multiline'> {
  minRows?: number;
  maxRows?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({ minRows = 3, maxRows, ...props }) => {
  return <TextField multiline minRows={minRows} maxRows={maxRows} variant="outlined" {...props} />;
};
