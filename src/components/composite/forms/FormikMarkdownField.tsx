import clsx from 'clsx';
import React, { FC, useMemo } from 'react';
import { FormGroup, FormHelperText, InputLabel, InputProps } from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import { useField } from 'formik';
import { makeStyles } from '@mui/styles';

const useStyle = makeStyles(theme => ({
  padding: {
    /*
      select the inner div only if state classes are applied
      and offset the text to the left if a tick or error icon is displayed
    */
    '&.is-invalid .w-md-editor-content .w-md-editor-preview, &.is-valid .w-md-editor-content .w-md-editor-preview': {
      paddingRight: 30,
    },
  },
  withTooltipIcon: {
    display: 'flex',
    gap: theme.spacing(0.5),
  },
}));

interface MarkdownFieldProps extends InputProps {
  title?: string;
  tooltipTitle?: string;
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
  tooltipTitle,
  name,
  required = false,
  readOnly = false,
  disabled = false,
  placeholder,
  autoComplete,
  rows = 10,
}) => {
  const styles = useStyle();
  const [field, meta, helper] = useField(name);
  const validClass = useMemo(() => (required && Boolean(!meta.error) && meta.touched ? 'is-valid' : undefined), [meta]);
  const invalidClass = useMemo(() => (Boolean(!!meta.error) && meta.touched ? 'is-invalid' : undefined), [meta]);

  return (
    <FormGroup>
      <div className={styles.withTooltipIcon}>
        {title && <InputLabel required={required}>{title}</InputLabel>}
        {tooltipTitle && (
          <Tooltip title={tooltipTitle} arrow placement="top" aria-label={`tooltip-${title}`}>
            <InfoIcon fontSize="inherit" color="primary" />
          </Tooltip>
        )}
      </div>
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
          rows,
        }}
      />
      <FormHelperText error={Boolean(meta.error)}>{meta.error}</FormHelperText>
    </FormGroup>
  );
};
export default FormikMarkdownField;
