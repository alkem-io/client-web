import React from 'react';
import { Col, Form } from 'react-bootstrap';
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
          <FormikInputField
            name={name}
            title={label}
            placeholder={placeholder || label}
            className={styles.field}
            disabled={disabled}
            required={required}
            multiline={!!rows && rows > 1}
            rows={rows}
          />
        </Form.Group>
      </Form.Row>
    );
  };
};
