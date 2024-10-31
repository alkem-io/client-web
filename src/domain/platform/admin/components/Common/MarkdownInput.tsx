import { Grid } from '@mui/material';

import FormikMarkdownField from '../../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';

import useProfileStyles from './useProfileStyles';
import { MarkdownTextMaxLength } from '../../../../../core/ui/forms/field-length.constants';

/**
 * @deprecated - remove, use FormikMarkdownField directly
 */
const MarkdownInput = ({
  name,
  rows,
  label,
  loading,
  required,
  maxLength,
  helperText,
  placeholder,
  disabled = false,
}: MarkdownInputFieldProps) => {
  const styles = useProfileStyles();

  return (
    <Grid item xs={12}>
      <FormikMarkdownField
        name={name}
        rows={rows}
        title={label}
        loading={loading}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        helperText={helperText}
        className={styles.field}
        placeholder={placeholder || label}
      />
    </Grid>
  );
};

export default MarkdownInput;

type MarkdownInputFieldProps = {
  name: string;
  label: string;

  rows?: number;
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  placeholder?: string;
  maxLength?: MarkdownTextMaxLength;
};
