import { Grid } from '@mui/material';
import React, { FC } from 'react';
import FormikMarkdownField from '../../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import useProfileStyles from './useProfileStyles';

interface MarkdownInputFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  withCounter?: boolean;
  helperText?: string;
  loading?: boolean;
}

const MarkdownInput: FC<MarkdownInputFieldProps> = ({
  name,
  label,
  placeholder,
  rows,
  disabled = false,
  required,
  maxLength,
  withCounter,
  helperText,
  loading,
}: MarkdownInputFieldProps) => {
  const styles = useProfileStyles();

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
        maxLength={maxLength}
        withCounter={withCounter}
        helperText={helperText}
        loading={loading}
      />
    </Grid>
  );
};

export default MarkdownInput;
