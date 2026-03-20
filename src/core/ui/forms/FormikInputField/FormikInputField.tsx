import { Box, type BoxProps, CircularProgress, FormHelperText, TextField, type TextFieldProps } from '@mui/material';
import type { DistributiveOmit } from '@mui/types';
import { useField } from 'formik';
import { type ReactNode, useMemo } from 'react';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import HelpButton from '@/core/ui/button/HelpButton';
import { useValidationMessageTranslation } from '@/domain/shared/i18n/ValidationMessageTranslation';
import CharacterCounter from '../characterCounter/CharacterCounter';

export type FormikInputFieldProps = DistributiveOmit<TextFieldProps, 'variant'> & {
  title: string;
  name: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
  helpIconText?: string;
  helpText?: string;
  loading?: boolean;
  counterDisabled?: boolean;
  maxLength?: number;
  endAdornment?: ReactNode;
  containerProps?: BoxProps;
};

export const FormikInputField = ({
  title,
  name,
  required = false,
  readOnly = false,
  disabled = false,
  type,
  placeholder,
  autoComplete,
  InputProps,
  helpIconText,
  helperText: _helperText,
  loading,
  rows,
  counterDisabled = false,
  maxLength,
  fullWidth,
  endAdornment,
  containerProps,
  ...rest
}: FormikInputFieldProps) => {
  // NOTE: FormikFormattedInputField is using this component for DRY  it relies on the fact that value/onChange/onBlur
  // are not destructured by FormikInputField and therefore pass through rest.
  // If this component needs to explicitly destructure those props, this override mechanism would silently break.
  // Make sure it doesn't
  const tErr = useValidationMessageTranslation();
  const [field, meta, helpers] = useField(name);
  const isError = Boolean(meta.error) && meta.touched;

  const helperText = useMemo(() => {
    if (!isError) {
      return _helperText;
    }

    if (typeof meta.error === 'string' && meta.error.indexOf('required') !== -1) {
      return tErr('forms.validations.required');
    }

    return tErr(meta.error as TranslationKey, { field: title });
  }, [isError, meta.error, _helperText, tErr, title]);

  return (
    <Box width={fullWidth ? '100%' : undefined} {...containerProps}>
      <TextField
        name={name}
        placeholder={placeholder}
        label={title}
        onBlur={field.onBlur}
        onChange={event => helpers.setValue(event.target.value)}
        value={field.value}
        variant="outlined"
        error={isError}
        required={required}
        disabled={loading || disabled}
        autoComplete={autoComplete}
        rows={rows}
        multiline={!!rows}
        fullWidth={true}
        InputProps={{
          ...InputProps,
          endAdornment: (
            <>
              {loading && <CircularProgress size={20} />}
              {helpIconText && <HelpButton helpText={helpIconText} />}
              {endAdornment}
            </>
          ),
          readOnly: readOnly,
        }}
        {...rest}
      />
      <CharacterCounter count={field.value?.length} maxLength={maxLength} disabled={counterDisabled || !maxLength}>
        <FormHelperText error={isError}>{helperText}</FormHelperText>
      </CharacterCounter>
    </Box>
  );
};

export default FormikInputField;
