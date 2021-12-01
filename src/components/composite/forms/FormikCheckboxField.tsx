import { Checkbox, CheckboxProps, FormControl, FormControlLabel, FormGroup, FormHelperText } from '@mui/material';
import { useField } from 'formik';
import React, { FC } from 'react';

interface CheckboxFieldProps extends CheckboxProps {
  title: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
}

export const FormikCheckboxField: FC<CheckboxFieldProps> = ({ title, name, required = false, disabled = false }) => {
  const [field, meta] = useField(name);

  const checkbox = (
    <Checkbox name={name} checked={field.value} onChange={field.onChange} onBlur={field.onBlur} color={'primary'} />
  );

  return (
    <FormControl required={required} disabled={disabled}>
      <FormGroup row>
        <FormControlLabel control={checkbox} label={title} />
      </FormGroup>
      <FormHelperText>{meta.error}</FormHelperText>
    </FormControl>
  );
};
export default FormikCheckboxField;
