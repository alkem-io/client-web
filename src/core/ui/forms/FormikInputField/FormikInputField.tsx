import { useMemo, ReactNode } from 'react';

import { useField } from 'formik';
import { DistributiveOmit } from '@mui/types';
import { Box, FormHelperText, TextField, TextFieldProps } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress/CircularProgress';

import HelpButton from '../../button/HelpButton';
import TranslationKey from '../../../i18n/utils/TranslationKey';
import CharacterCounter from '../characterCounter/CharacterCounter';

import { useValidationMessageTranslation } from '../../../../domain/shared/i18n/ValidationMessageTranslation';

export const FormikInputField = ({
  rows,
  name,
  title,
  loading,
  fullWidth,
  maxLength,
  InputProps,
  placeholder,
  autoComplete,
  endAdornment,
  helpIconText,
  required = false,
  readOnly = false,
  disabled = false,
  helperText: _helperText,
  counterDisabled = false,
  ...rest
}: FormikInputFieldProps) => {
  const [field, meta, helpers] = useField(name);

  const tErr = useValidationMessageTranslation();

  const isError = Boolean(meta.error) && meta.touched;

  const helperText = useMemo(() => {
    if (!isError) {
      return _helperText;
    }

    return tErr(meta.error as TranslationKey, { field: title });
  }, [isError, meta.error, _helperText, tErr, title]);

  return (
    <Box width={fullWidth ? '100%' : undefined}>
      <TextField
        fullWidth
        rows={rows}
        name={name}
        label={title}
        error={isError}
        variant="outlined"
        multiline={!!rows}
        required={required}
        value={field.value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={loading || disabled}
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
        onBlur={field.onBlur}
        onChange={event => helpers.setValue(event.target.value)}
        {...rest}
      />

      <CharacterCounter count={field.value?.length} maxLength={maxLength} disabled={counterDisabled || !maxLength}>
        <FormHelperText error={isError}>{helperText}</FormHelperText>
      </CharacterCounter>
    </Box>
  );
};

export default FormikInputField;

export type FormikInputFieldProps = DistributiveOmit<TextFieldProps, 'variant'> & {
  name: string;
  title: string;
  helpText?: string;
  loading?: boolean;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  maxLength?: number;
  placeholder?: string;
  autoComplete?: string;
  helpIconText?: string;
  endAdornment?: ReactNode;
  counterDisabled?: boolean;
};
