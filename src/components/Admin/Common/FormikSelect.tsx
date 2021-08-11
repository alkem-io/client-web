import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectProps,
} from '@material-ui/core';
import { useField } from 'formik';
import React, { FC } from 'react';

interface FormikSelectProps extends SelectProps {
  title: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  values: { id: string; name: string }[];
  placeholder?: string;
}

export const FormikSelect: FC<FormikSelectProps> = ({
  title,
  name,
  required = false,
  disabled = false,
  values,
  placeholder,
}) => {
  const [field, meta] = useField(name);

  return (
    <FormControl required={required} disabled={disabled} fullWidth variant="outlined" error={!!meta.error}>
      <InputLabel shrink={true}>{title}</InputLabel>
      <Select
        name={name}
        value={field.value}
        label={title}
        onBlur={field.onBlur}
        onChange={field.onChange}
        variant={'outlined'}
        placeholder={placeholder}
        input={<OutlinedInput name={name} notched label={title} placeholder={placeholder} />}
      >
        {values.map(el => (
          <MenuItem key={el.id} value={el.id}>
            {el.name}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{meta.error}</FormHelperText>
    </FormControl>
  );
};
export default FormikSelect;
