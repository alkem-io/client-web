import clsx from 'clsx';
import { useField } from 'formik';
import React, { FC } from 'react';
import { Form, FormControlProps } from 'react-bootstrap';
import { createStyles } from '../../../hooks/useTheme';
import Markdown from '../../core/Markdown';
import { Required } from '../../Required';

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

const useStyles = createStyles(theme => ({
  previewWrapper: {
    flexGrow: 1,
    flexBasis: '50%',
    display: 'flex',
    flexDirection: 'column',
  },
  preview: {
    flex: '1 1 auto',
    overflowY: 'auto',
  },
  spacer: {
    padding: theme.shape.spacing(0.5),
  },
}));

export const FormikMarkdownField: FC<MarkdownFieldProps> = ({
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
  const { children, className, ...passThruProps } = rest;
  const styles = useStyles();

  return (
    <>
      <Form.Label>
        {title}
        {required && <Required />}
      </Form.Label>
      <div style={{ display: 'flex' }}>
        <div style={{ flexGrow: 1, flexBasis: '50%' }}>
          <Form.Control
            name={name}
            as={'textarea'}
            type={type || 'text'}
            placeholder={placeholder || title}
            children={field.value}
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
        </div>
        <div className={styles.spacer}></div>
        <div className={styles.previewWrapper}>
          <Form.Control
            as={Markdown}
            className={clsx(styles.preview, 'form-control', className)}
            children={field.value}
            {...passThruProps}
          />
        </div>
      </div>
      <Form.Control.Feedback type="invalid">{meta.error}</Form.Control.Feedback>
    </>
  );
};
export default FormikMarkdownField;
