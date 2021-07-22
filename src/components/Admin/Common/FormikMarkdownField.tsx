import MDEditor from '@uiw/react-md-editor';
import clsx from 'clsx';
import { useField } from 'formik';
import React, { FC, useMemo } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';
import { Required } from '../../Required';
import { createStyles } from '../../../hooks/useTheme';

createStyles(() => ({
  padding: {
    padding: 0,

    '& .w-md-editor-content .w-md-editor-preview': {
      paddingRight: 30,
    },
  },
}));

interface MarkdownFieldProps extends FormControlProps {
  title: string;
  name: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
  rows?: number;
}

export const FormikMarkdownField: FC<MarkdownFieldProps> = ({
  title,
  name,
  required = false,
  readOnly = false,
  disabled = false,
  placeholder,
  autoComplete,
}) => {
  const [field, meta, helper] = useField(name);
  const validClass = useMemo(
    () => (required && Boolean(!meta.error) && meta.touched ? 'padding form-control is-valid' : undefined),
    [meta]
  );
  const invalidClass = useMemo(
    () => (Boolean(!!meta.error) && meta.touched ? 'padding form-control is-invalid' : undefined),
    [meta]
  );

  return (
    <>
      <Form.Label>
        {title}
        {required && <Required />}
      </Form.Label>
      <MDEditor
        value={field.value}
        onChange={e => helper.setValue(e)}
        className={clsx(validClass, invalidClass)}
        style={{ padding: 0 }}
        textareaProps={{
          name: name,
          placeholder: placeholder || title,
          required: required,
          readOnly: readOnly,
          disabled: disabled,
          autoComplete: autoComplete,
          onBlur: field.onBlur,
        }}
      />
      <Form.Control.Feedback type="invalid">{meta.error}</Form.Control.Feedback>
    </>
  );
};
export default FormikMarkdownField;
