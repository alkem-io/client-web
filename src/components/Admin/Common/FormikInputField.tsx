import { TextField, TextFieldProps } from '@material-ui/core';
import { useField } from 'formik';
import React, { FC } from 'react';
type InputFieldProps = TextFieldProps & {
  title: string;
  name: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
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
  ...rest
}) => {
  const [field, meta] = useField(name);

  return (
    <TextField
      name={name}
      label={title}
      onBlur={field.onBlur}
      onChange={field.onChange}
      value={field.value}
      variant={'outlined'}
      InputLabelProps={{ shrink: true }}
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error}
      required={required}
      disabled={disabled}
      autoComplete={autoComplete}
      fullWidth
      InputProps={{
        readOnly: readOnly,
      }}
      {...rest}
    />
  );
};
export default FormikInputField;
