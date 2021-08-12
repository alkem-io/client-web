import { Grid } from '@material-ui/core';
import React from 'react';
import FormikMarkdownField from './FormikMarkdownField';
import useProfileStyles from './useProfileStyles';

interface MarkdownInputFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
}

export const useMarkdownInputField = () => {
  const styles = useProfileStyles();
  return ({ name, label, placeholder, rows, disabled = false, required }: MarkdownInputFieldProps) => {
    return (
      <Grid item xs={12}>
        <FormikMarkdownField
          name={name}
          title={label}
          placeholder={placeholder || label}
          className={styles.field}
          disabled={disabled}
          rows={rows}
          required={required}
        />
      </Grid>
    );
  };
};
