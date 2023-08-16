import React, { FC } from 'react';
import { FormControlLabel, FormGroup, Switch, SwitchProps } from '@mui/material';
import { useField } from 'formik';

interface FormikSwitchProps extends SwitchProps {
  title: string;
  name: string;
  required?: boolean;
}

export const FormikSwitch: FC<FormikSwitchProps> = ({ title, name, required, ...rest }) => {
  const [field] = useField(name);

  const switchField = (
    <Switch name={name} checked={field.value} onChange={field.onChange} onBlur={field.onBlur} {...rest} />
  );

  return (
    <FormGroup>
      <FormControlLabel control={switchField} label={title} />
    </FormGroup>
  );
};
