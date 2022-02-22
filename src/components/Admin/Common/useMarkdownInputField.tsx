import { Grid } from '@mui/material';
import React from 'react';
import FormikMarkdownField from '../../composite/forms/FormikMarkdownField';
import useProfileStyles from './useProfileStyles';

interface MarkdownInputFieldProps {
  name: string;
  label: string;
  tooltipLabel?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  loading?: boolean;
}

export const useMarkdownInputField = () => {
  const styles = useProfileStyles();
  return ({
    name,
    label,
    tooltipLabel,
    placeholder,
    rows,
    disabled = false,
    required,
    loading,
  }: MarkdownInputFieldProps) => (
    <Grid item xs={12}>
      <FormikMarkdownField
        name={name}
        title={label}
        tooltipTitle={tooltipLabel}
        placeholder={placeholder || label}
        className={styles.field}
        disabled={disabled}
        rows={rows}
        required={required}
        loading={loading}
      />
    </Grid>
  );
};
