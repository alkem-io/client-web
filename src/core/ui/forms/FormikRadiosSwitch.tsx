import { InputLabel, Radio } from '@mui/material';
import { useField } from 'formik';
import Gutters, { GuttersProps } from '../grid/Gutters';
import { BlockSectionTitle } from '../typography';

interface FormikSwitchProps<T> extends GuttersProps {
  name: string;
  label: string;
  options: { value: T; label: string }[];
}

export const FormikRadiosSwitch = <T,>({ name, label, options, ...rest }: FormikSwitchProps<T>) => {
  const [field, , helper] = useField(name);

  const handleChange = (value: T) => {
    helper.setValue(value);
  };

  return (
    <Gutters alignItems="center" {...rest}>
      <BlockSectionTitle>{label}</BlockSectionTitle>
      {options.map(({ value, label }, index) => (
        <InputLabel key={index}>
          <Radio
            name={name}
            checked={field.value === value}
            onClick={() => handleChange(value)}
            onBlur={field.onBlur}
          />{' '}
          {label}
        </InputLabel>
      ))}
    </Gutters>
  );
};
