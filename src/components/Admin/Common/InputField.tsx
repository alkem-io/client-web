import { useField } from 'formik';
import React, { FC } from 'react';
import { Form } from 'react-bootstrap';

interface InputFieldProps {
  title: string;
  value: string;
  name: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  as?: React.ElementType;
}

export const InputField: FC<InputFieldProps> = ({
  title,
  value,
  name,
  required = false,
  readOnly = false,
  disabled = false,
  type,
  placeholder,
  as,
  autoComplete,
}) => {
  const [field, meta] = useField(name);

  return (
    <>
      <Form.Label>
        {title}
        {required && <span style={{ color: '#d93636' }}>{' *'}</span>}
      </Form.Label>
      <Form.Control
        name={name}
        as={as ? as : 'input'}
        type={type || 'text'}
        placeholder={placeholder || title}
        value={value}
        onChange={field.onChange}
        required={required}
        readOnly={readOnly}
        disabled={disabled}
        isValid={required ? Boolean(!meta.error) && meta.touched : undefined}
        isInvalid={Boolean(!!meta.error) && meta.touched}
        autoComplete={autoComplete}
        onBlur={field.onBlur}
      />
      <Form.Control.Feedback type="invalid">{meta.error}</Form.Control.Feedback>
    </>
  );
};
export default InputField;
