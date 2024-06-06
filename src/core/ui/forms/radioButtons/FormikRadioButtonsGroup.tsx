import { useField } from 'formik';
import RadioButtonsGroup, { RadioButtonsGroupProps } from './RadioButtonsGroup';

interface FormikRadioButtonsGroupProps extends Omit<RadioButtonsGroupProps<unknown>, 'value' | 'onChange'> {
  name: string;
}

const FormikRadioButtonsGroup = ({ name, options, ...rest }: FormikRadioButtonsGroupProps) => {
  const [{ value }, , { setValue }] = useField<unknown>(name);

  return <RadioButtonsGroup value={value} options={options} onChange={setValue} {...rest} />;
};

export default FormikRadioButtonsGroup;
