import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { MarkdownTextMaxLength } from '@/core/ui/forms/field-length.constants';
import { Grid } from '@mui/material';
import { FC } from 'react';

interface MarkdownInputFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  maxLength?: MarkdownTextMaxLength;
  helperText?: string;
  loading?: boolean;
}

/**
 * @deprecated - remove, use FormikMarkdownField directly
 */
const MarkdownInput: FC<MarkdownInputFieldProps> = ({
  name,
  label,
  placeholder,
  rows,
  disabled = false,
  required,
  maxLength,
  helperText,
  loading,
}: MarkdownInputFieldProps) => {
  return (
    <Grid item xs={12}>
      <FormikMarkdownField
        name={name}
        title={label}
        placeholder={placeholder || label}
        disabled={disabled}
        rows={rows}
        required={required}
        maxLength={maxLength}
        helperText={helperText}
        loading={loading}
      />
    </Grid>
  );
};

export default MarkdownInput;
