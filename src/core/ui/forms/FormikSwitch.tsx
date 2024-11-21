import { FormControlLabel, FormGroup, Switch, SwitchProps } from '@mui/material';
import { useField } from 'formik';

interface FormikSwitchProps extends SwitchProps {
  title: string;
  name: string;
  required?: boolean;
}

export const FormikSwitch = ({ title, name, required, ...rest }: FormikSwitchProps) => {
  const [field] = useField(name);

  return (
    <FormGroup>
      <FormControlLabel
        control={<Switch name={name} checked={field.value} onChange={field.onChange} onBlur={field.onBlur} {...rest} />}
        label={title}
      />
    </FormGroup>
  );
};
