import React, { FC } from 'react';
import { Col, Form } from 'react-bootstrap';
import FormikInputField from '../Common/FormikInputField';
import FormikTextAreaField from '../Common/FormikTextAreaField';
import { useProfileStyles } from '../EcoverseEditForm';

interface ContextSegmentProps {}

export const ContextSegment: FC<ContextSegmentProps> = () => {
  const styles = useProfileStyles();
  const getInput = ({
    name,
    label,
    placeholder,
    rows,
    disabled = false,
    required,
  }: {
    name: string;
    label: string;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    required?: boolean;
  }) => {
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
  return (
    <>
      {getInput({ name: 'tagline', label: 'Tagline' })}
      {getInput({ name: 'background', label: 'Background', rows: 3 })}
      {getInput({ name: 'impact', label: 'Impact', rows: 3 })}
      {getInput({ name: ' ', label: 'Vision', rows: 3 })}
      {getInput({ name: 'who', label: 'Who', rows: 3 })}
    </>
  );
};
export default ContextSegment;
