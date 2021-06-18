import { useField } from 'formik';
import React, { FC } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';
import { Required } from '../../Required';

interface TextAreaFieldProps extends FormControlProps {
  title: string;
  value: string;
  name: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
  rows?: number;
}

export const FormikTextAreaField: FC<TextAreaFieldProps> = ({
  title,
  value,
  name,
  required = false,
  readOnly = false,
  disabled = false,
  type,
  placeholder,
  autoComplete,
  ...rest
}) => {
  const [field, meta] = useField(name);

  return (
    <>
      <Form.Label>
        {title}
        {required && <Required />}
      </Form.Label>
      <Form.Control
        name={name}
        as={'textarea'}
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
        {...rest}
      />
      <Form.Control.Feedback type="invalid">{meta.error}</Form.Control.Feedback>
    </>
  );
};
export default FormikTextAreaField;
