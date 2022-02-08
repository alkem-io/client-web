import { Grid } from '@mui/material';
import React from 'react';
import FormikInputField from '../../composite/forms/FormikInputField';
import useProfileStyles from './useProfileStyles';

interface InputFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
}

export const useInputField = () => {
  const styles = useProfileStyles();
  return ({ name, label, placeholder, rows, disabled = false, required, helpText }: InputFieldProps) => {
    return (
      <Grid item xs={12}>
        <FormikInputField
          name={name}
          title={label}
          placeholder={placeholder || label}
          className={styles.field}
          disabled={disabled}
          required={required}
          multiline={!!rows && rows > 1}
          rows={rows}
          helpText={helpText}
        />
      </Grid>
    );
  };
};
