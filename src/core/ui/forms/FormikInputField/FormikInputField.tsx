import React, { FC, ReactNode, useMemo } from 'react';
import { useField } from 'formik';
import { Box, FormHelperText, TextField, TextFieldProps } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress/CircularProgress';
import { DistributiveOmit } from '@mui/types';
import TranslationKey from '../../../../types/TranslationKey';
import { useValidationMessageTranslation } from '../../../../domain/shared/i18n/ValidationMessageTranslation';
import HelpButton from '../../../../common/components/core/HelpButton';
import CharacterCounter from '../../../../common/components/composite/common/CharacterCounter/CharacterCounter';

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
  withCounter?: boolean;
  maxLength?: number;
  endAdornment?: ReactNode;
};

export const FormikInputField: FC<FormikInputFieldProps> = ({
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
  withCounter,
  maxLength,
  fullWidth,
  endAdornment,
  ...rest
}) => {
  const tErr = useValidationMessageTranslation();
  const [field, meta, helpers] = useField(name);
  const isError = Boolean(meta.error) && meta.touched;
  const helperText = useMemo(() => {
    if (!isError) {
      return _helperText;
    }

    return tErr(meta.error as TranslationKey, { field: title });
  }, [isError, meta.error, _helperText, tErr, title]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      helpers.setValue(undefined);
    } else {
      helpers.setValue(e.target.value);
    }
  };

  if (withCounter && (maxLength === undefined || maxLength < 0)) {
    throw new Error('Counter requires "maxLength" property to be defined and with a positive value!');
  }

  return (
    <Box width={fullWidth ? '100%' : undefined}>
      <TextField
        name={name}
        placeholder={placeholder}
        label={title}
        onBlur={field.onBlur}
        onChange={handleOnChange}
        value={field.value}
        variant="outlined"
        error={isError}
        required={required}
        disabled={loading || disabled}
        autoComplete={autoComplete}
        rows={rows}
        multiline={!!rows}
        fullWidth
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
      <CharacterCounter count={field.value?.length} maxLength={maxLength} disabled={!withCounter}>
        <FormHelperText error={isError}>{helperText}</FormHelperText>
      </CharacterCounter>
    </Box>
  );
};

export default FormikInputField;
