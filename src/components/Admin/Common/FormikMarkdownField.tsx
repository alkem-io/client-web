import MDEditor from '@uiw/react-md-editor';
import clsx from 'clsx';
import { useField } from 'formik';
import React, { FC, useMemo } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';
import { Required } from '../../core/Required';
import { createStyles } from '../../../hooks/useTheme';

const useStyle = createStyles(() => ({
  padding: {
    /*
      select the inner div only if state classes are applied
      and offset the text to the left if a tick or error icon is displayed
    */
    '&.is-invalid .w-md-editor-content .w-md-editor-preview, &.is-valid .w-md-editor-content .w-md-editor-preview': {
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
  const styles = useStyle();
  const [field, meta, helper] = useField(name);
  const validClass = useMemo(() => (required && Boolean(!meta.error) && meta.touched ? 'is-valid' : undefined), [meta]);
  const invalidClass = useMemo(() => (Boolean(!!meta.error) && meta.touched ? 'is-invalid' : undefined), [meta]);

  return (
    <>
      <Form.Label>
        {title}
        {required && <Required />}
      </Form.Label>
      <MDEditor
        value={field.value}
        onChange={e => helper.setValue(e)}
        className={clsx('form-control', styles.padding, validClass, invalidClass)}
        style={{ padding: 0 }} /* using style because it's overwritten otherwise */
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
