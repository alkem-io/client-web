import { useField } from 'formik';
import RadioButtonsGroup, { RadioButtonsGroupProps } from './RadioButtonsGroup';

interface FormikRadioButtonsGroupProps extends Omit<RadioButtonsGroupProps<unknown>, 'value' | 'onChange'> {
  name: string;
  readOnly?: boolean;
}

const FormikRadioButtonsGroup = ({ name, options, readOnly, ...rest }: FormikRadioButtonsGroupProps) => {
  const [{ value }, , { setValue }] = useField<unknown>(name);

  return <RadioButtonsGroup value={value} options={options} readOnly={readOnly} onChange={setValue} {...rest} />;
};

export default FormikRadioButtonsGroup;
