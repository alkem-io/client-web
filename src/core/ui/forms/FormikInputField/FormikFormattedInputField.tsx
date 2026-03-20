import { useField } from 'formik';
import { type FocusEvent, useState } from 'react';
import FormikInputField, { type FormikInputFieldProps } from './FormikInputField';

export type ValueFormatterContext = {
  isFocused: boolean;
};

export type ValueParserContext = {
  isBlur: boolean;
};

export type FormikFormattedInputFieldProps = Omit<
  FormikInputFieldProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus'
> & {
  valueFormatter: (value: unknown, context: ValueFormatterContext) => string;
  valueParser: (value: string, context: ValueParserContext) => unknown;
};

const FormikFormattedInputField = ({ name, valueFormatter, valueParser, ...rest }: FormikFormattedInputFieldProps) => {
  const [, { value }, { setValue, setTouched }] = useField(name);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsFocused(true);
    setTouched(true);
    rest.InputProps?.onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(valueParser(event.target.value, { isBlur: true }));
    setIsFocused(false);
    setTouched(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(valueParser(event.target.value, { isBlur: false }));
    setTouched(true);
  };

  return (
    <FormikInputField
      name={name}
      value={valueFormatter(value, { isFocused })}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      {...rest}
    />
  );
};

export default FormikFormattedInputField;
