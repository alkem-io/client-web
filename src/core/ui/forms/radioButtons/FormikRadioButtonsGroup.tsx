import { ComponentType, ReactNode } from 'react';
import { SvgIconProps } from '@mui/material';
import { useField } from 'formik';
import RadioButtonsGroup from './RadioButtonsGroup';

interface FormikRadioButtonsGroupProps<Value> {
  name: string;
  options: {
    icon: ComponentType<SvgIconProps>;
    value: Value;
    label: ReactNode;
  }[];
}

const FormikRadioButtonsGroup = <Value,>({ name, options }: FormikRadioButtonsGroupProps<Value>) => {
  const [{ value }, , { setValue }] = useField<Value>(name);

  return (
    <RadioButtonsGroup value={value} options={options} onChange={setValue} />
  );
};

export default FormikRadioButtonsGroup;