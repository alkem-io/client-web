import {
  Checkbox,
  CheckboxProps,
  FormControl,
  FormControlLabel,
  FormControlProps,
  FormGroup,
  FormHelperText,
} from '@mui/material';
import { useField } from 'formik';
import { ReactNode } from 'react';

interface CheckboxFieldProps extends CheckboxProps {
  label: ReactNode;
  name: string;
  required?: boolean;
  disabled?: boolean;
  containerProps?: FormControlProps;
}

export const FormikCheckboxField = ({
  label,
  name,
  required = false,
  disabled = false,
  containerProps,
}: CheckboxFieldProps) => {
  const [field, meta, helpers] = useField<boolean>(name);

  return (
    <FormControl required={required} disabled={disabled} {...containerProps}>
      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox
              name={name}
              checked={field.value}
              onChange={event => helpers.setValue(event.target.checked)}
              onBlur={field.onBlur}
              color={'primary'}
            />
          }
          label={label}
        />
      </FormGroup>
      {meta.error && meta.touched && <FormHelperText>{meta.error}</FormHelperText>}
    </FormControl>
  );
};

export default FormikCheckboxField;
