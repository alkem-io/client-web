import { useField } from 'formik';
import React, { FC } from 'react';
import { Form, Col } from 'react-bootstrap';
import { Required } from '../../core/Required';

interface CheckBoxFieldProps {
  value?: string | ReadonlyArray<string> | number;
  name: string;
  title?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  type?: 'checkbox' | 'radio';
  placeholder?: string;
}

export const CheckBoxField: FC<CheckBoxFieldProps> = ({
  name,
  required = false,
  readOnly = false,
  disabled = false,
  type = 'checkbox',
  children,
}) => {
  const [field, meta] = useField(name);

  return (
    <Form.Group as={Col}>
      <Form.Check name={name} type={type}>
        <Form.Check.Input
          name={name}
          type={type}
          readOnly={readOnly}
          disabled={disabled}
          onChange={field.onChange}
          isInvalid={Boolean(!!meta.error)}
        />
        <Form.Check.Label>
          {children}
          {required && <Required />}
        </Form.Check.Label>
        <Form.Control.Feedback type="invalid">{meta.error}</Form.Control.Feedback>
      </Form.Check>
    </Form.Group>
  );
};
export default CheckBoxField;
