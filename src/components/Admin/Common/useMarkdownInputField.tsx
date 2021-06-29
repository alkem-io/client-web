import React from 'react';
import { Col, Form } from 'react-bootstrap';
import FormikMarkdownField from './FormikMarkdownField';
import useProfileStyles from './useProfileStyles';

interface MarkdownInputFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
}

export const useMarkdownInputField = () => {
  const styles = useProfileStyles();
  return ({ name, label, placeholder, rows, disabled = false, required }: MarkdownInputFieldProps) => {
    return (
      <Form.Row>
        <Form.Group as={Col} controlId={name}>
          <FormikMarkdownField
            name={name}
            title={label}
            placeholder={placeholder || label}
            className={styles.field}
            disabled={disabled}
            rows={rows}
            required={required}
          />
        </Form.Group>
      </Form.Row>
    );
  };
};
