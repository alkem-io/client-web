import { FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectProps } from '@material-ui/core';
import { useField } from 'formik';
import React, { FC } from 'react';

interface FormikSelectProps extends SelectProps {
  title: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  values: { id: string; label: string }[];
}

export const FormikSelect: FC<FormikSelectProps> = ({ title, name, required = false, disabled = false, values }) => {
  const [field, meta] = useField(name);

  return (
    <FormControl required={required} disabled={disabled} fullWidth variant="outlined">
      <InputLabel shrink={true}>{title}</InputLabel>
      <Select name={name} value={field.value} label={title} onBlur={field.onBlur} onChange={field.onChange}>
        {values.map(el => (
          <MenuItem value={el.id}>{el.label}</MenuItem>
        ))}
      </Select>
      <FormHelperText>{meta.error}</FormHelperText>
    </FormControl>
  );
};
export default FormikSelect;
