import { FormControlLabel, FormGroup, Switch, SwitchProps } from '@mui/material';
import { useField } from 'formik';
import { ReactNode } from 'react';

interface FormikSwitchProps extends Omit<SwitchProps, 'label'> {
  label: ReactNode;
  name: string;
  required?: boolean;
}

export const FormikSwitch = ({ label, name, required, ...rest }: FormikSwitchProps) => {
  const [field] = useField(name);

  return (
    <FormGroup>
      <FormControlLabel
        control={<Switch name={name} checked={field.value} onChange={field.onChange} onBlur={field.onBlur} {...rest} />}
        label={label}
      />
    </FormGroup>
  );
};
