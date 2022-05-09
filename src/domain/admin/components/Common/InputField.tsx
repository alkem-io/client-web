import { Grid } from '@mui/material';
import React, { FC } from 'react';
import FormikInputField from '../../../../common/components/composite/forms/FormikInputField';
import useProfileStyles from './useProfileStyles';

interface InputFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
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
        loading={loading}
      />
    </Grid>
  );
};

export default InputField;
