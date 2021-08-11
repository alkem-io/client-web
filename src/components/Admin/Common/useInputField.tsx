import { Grid } from '@material-ui/core';
import React from 'react';
import FormikInputField from './FormikInputField';
import useProfileStyles from './useProfileStyles';

interface InputFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
}

export const useInputField = () => {
  const styles = useProfileStyles();
  return ({ name, label, placeholder, rows, disabled = false, required }: InputFieldProps) => {
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
        />
      </Grid>
    );
  };
};
