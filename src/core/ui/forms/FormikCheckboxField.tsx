import { Checkbox, CheckboxProps, FormControl, FormControlLabel, FormGroup, FormHelperText } from '@mui/material';
import { useField } from 'formik';

interface CheckboxFieldProps extends CheckboxProps {
  title: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
}

export const FormikCheckboxField = ({ title, name, required = false, disabled = false }: CheckboxFieldProps) => {
  const [field, meta] = useField(name);

  return (
    <FormControl required={required} disabled={disabled}>
      <FormGroup row>
        <FormControlLabel
          control={
            <Checkbox
              name={name}
              checked={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              color={'primary'}
            />
          }
          label={title}
        />
      </FormGroup>
      <FormHelperText>{meta.error}</FormHelperText>
    </FormControl>
  );
};

export default FormikCheckboxField;
