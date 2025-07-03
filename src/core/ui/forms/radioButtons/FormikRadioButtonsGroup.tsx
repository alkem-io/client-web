import { useField } from 'formik';
import RadioButtonsGroup, { RadioButtonsGroupProps } from './RadioButtonsGroup';

interface FormikRadioButtonsGroupProps<Value> extends Omit<RadioButtonsGroupProps<Value>, 'value' | 'onChange'> {
  name: string;
  onChange?: (value: Value) => void;
}

const FormikRadioButtonsGroup = <Value,>({ name, onChange, options, ...rest }: FormikRadioButtonsGroupProps<Value>) => {
  const [{ value }, , { setValue }] = useField<Value>(name);
  const handleChange = newValue => {
    setValue(newValue);
    onChange?.(newValue);
  };
  return <RadioButtonsGroup value={value} options={options} onChange={handleChange} {...rest} />;
};

export default FormikRadioButtonsGroup;
