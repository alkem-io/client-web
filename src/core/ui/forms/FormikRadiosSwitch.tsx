import { InputLabel, Radio } from '@mui/material';
import { useField } from 'formik';
import Gutters, { GuttersProps } from '../grid/Gutters';
import { BlockSectionTitle } from '../typography';

interface FormikRadiosSwitchProps<T> extends GuttersProps {
  name: string;
  label: string;
  options: { value: T; label: string }[];
}

export const FormikRadiosSwitch = <T,>({ name, label, options, ...containerProps }: FormikRadiosSwitchProps<T>) => {
  const [field, , helper] = useField<T>(name);

  const handleChange = (value: T) => {
    helper.setValue(value);
  };

  return (
    <Gutters alignItems="center" {...containerProps}>
      <BlockSectionTitle>{label}</BlockSectionTitle>
      {options.map(({ value, label }, index) => (
        <InputLabel key={index}>
          <Radio
            name={name}
            checked={field.value === value}
            onClick={() => handleChange(value)}
            onBlur={field.onBlur}
          />
          {label}
        </InputLabel>
      ))}
    </Gutters>
  );
};
