import React from 'react';
import { Col, Form } from 'react-bootstrap';
import FormikTextAreaField from './FormikTextAreaField';
import FormikInputField from './FormikInputField';
import useProfileStyles from './useProfileStyles';

interface InputFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
}

export const useInputField = () => {
  const styles = useProfileStyles();
  return ({ name, label, placeholder, rows, disabled = false, required }: InputFieldProps) => {
    return (
      <Form.Row>
        <Form.Group as={Col} controlId={name}>
          {rows && rows > 1 ? (
            <FormikTextAreaField
              name={name}
              title={label}
              placeholder={placeholder || label}
              className={styles.field}
              disabled={disabled}
              rows={rows}
              required={required}
            />
          ) : (
            <FormikInputField
              name={name}
              title={label}
              placeholder={placeholder || label}
              className={styles.field}
              disabled={disabled}
              required={required}
            />
          )}
        </Form.Group>
      </Form.Row>
    );
  };
};
