import { Grid } from '@mui/material';
import React, { FC } from 'react';
import FormikMarkdownField from '../../../../common/components/composite/forms/FormikMarkdownField';
import useProfileStyles from './useProfileStyles';

interface MarkdownInputFieldProps {
  name: string;
  label: string;
  tooltipLabel?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  withCounter?: boolean;
  loading?: boolean;
}

const MarkdownInput: FC<MarkdownInputFieldProps> = ({
  name,
  label,
  tooltipLabel,
  placeholder,
  rows,
  disabled = false,
  required,
  maxLength,
  withCounter,
  loading,
}: MarkdownInputFieldProps) => {
  const styles = useProfileStyles();

  return (
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
        maxLength={maxLength}
        withCounter={withCounter}
        loading={loading}
      />
    </Grid>
  );
};

export default MarkdownInput;
