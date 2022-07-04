import { Grid } from '@mui/material';
import React, { FC } from 'react';
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
  maxLength?: number;
  withCounter?: boolean;
  loading?: boolean;
}

const InputField: FC<InputFieldProps> = ({
  name,
  label,
  placeholder = label,
  rows,
  disabled = false,
  required,
  helpText,
  maxLength,
  withCounter,
  loading,
}) => {
  const styles = useProfileStyles();

  return (
    <Grid item xs={12}>
      <FormikInputField
        name={name}
        title={label}
        placeholder={placeholder}
        className={styles.field}
        disabled={disabled}
        required={required}
        multiline={!!rows && rows > 1}
        rows={rows}
        helpText={helpText}
        maxLength={maxLength}
        withCounter={withCounter}
        loading={loading}
      />
    </Grid>
  );
};

export default InputField;
