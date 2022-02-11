import { TextField, TextFieldProps } from '@mui/material';
import { DistributiveOmit } from '@mui/types';
import { useField } from 'formik';
import React, { FC } from 'react';
import HelpButton from '../../core/HelpButton';
import CircularProgress from '@mui/material/CircularProgress/CircularProgress';
type InputFieldProps = DistributiveOmit<TextFieldProps, 'variant'> & {
  title: string;
  name: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
  helpText?: string;
  loading?: boolean;
};

export const FormikInputField: FC<InputFieldProps> = ({
  title,
  name,
  required = false,
  readOnly = false,
  disabled = false,
  type,
  placeholder,
  autoComplete,
  InputProps,
  helpText,
  loading,
  ...rest
}) => {
  const [field, meta] = useField(name);

  return (
    <TextField
      name={name}
      placeholder={placeholder}
      label={title}
      onBlur={field.onBlur}
      onChange={field.onChange}
      value={field.value}
      variant={'outlined'}
      InputLabelProps={{ shrink: true }}
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error}
      required={required}
      disabled={loading || disabled}
      autoComplete={autoComplete}
      fullWidth
      InputProps={{
        ...InputProps,
        endAdornment: (
          <>
            {loading && <CircularProgress size={20} />}
            {helpText && <HelpButton helpText={helpText} />}
          </>
        ),
        readOnly: readOnly,
      }}
      {...rest}
    />
  );
};
export default FormikInputField;
