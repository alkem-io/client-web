import { useField } from 'formik';
import React, { FC } from 'react';
import { Col, Form, FormControlProps } from 'react-bootstrap';
import { Required } from '../../core/Required';

interface CheckboxFieldProps extends FormControlProps {
  title: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
}

export const FormikCheckboxField: FC<CheckboxFieldProps> = ({ title, name, required = false, disabled = false }) => {
  const [field, meta] = useField(name);

  return (
    <Form.Row>
      <Form.Group as={Col} controlId={name}>
        <Form.Check name={name} type="checkbox">
          <Form.Check.Input
            type="checkbox"
            name={name}
            checked={field.value}
            value={String(field.value)}
            disabled={disabled}
            isValid={required ? Boolean(!meta.error) && meta.touched : undefined}
            isInvalid={Boolean(!!meta.error) && meta.touched}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
          <Form.Check.Label>
            {title}
            {required && <Required />}
          </Form.Check.Label>
        </Form.Check>
      </Form.Group>
    </Form.Row>
  );
};
export default FormikCheckboxField;
