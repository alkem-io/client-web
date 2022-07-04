import { Box, styled, TextField, TextFieldProps, Typography } from '@mui/material';
import { DistributiveOmit } from '@mui/types';
import { useField } from 'formik';
import React, { FC } from 'react';
import HelpButton from '../../core/HelpButton';
import CircularProgress from '@mui/material/CircularProgress/CircularProgress';
import TranslationKey from '../../../types/TranslationKey';
import { useValidationMessageTranslation } from '../../../domain/shared/i18n/ValidationMessageTranslation';

type InputFieldProps = DistributiveOmit<TextFieldProps, 'variant'> & {
  title: string;
  name: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
  helpText?: string;
  maxLength?: number;
  withCounter?: boolean;
  loading?: boolean;
};

const CharacterCounter = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  right: 0,
  top: theme.spacing(-2),
}));

export const FormikInputField: FC<InputFieldProps> = ({
  title,
  name,
  required = false,
  readOnly = false,
  disabled = false,
  type,
  placeholder,
  autoComplete,
  InputProps,
  helpText,
  maxLength,
  withCounter,
  loading,
  ...rest
}) => {
  const tErr = useValidationMessageTranslation();

  const [field, meta, helpers] = useField(name);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      helpers.setValue(undefined);
    } else {
      helpers.setValue(e.target.value);
    }
  };

  return (
    <>
      <TextField
        name={name}
        placeholder={placeholder}
        label={title}
        onBlur={field.onBlur}
        onChange={handleOnChange}
        value={field.value || ''}
        variant={'outlined'}
        InputLabelProps={{ shrink: true }}
        error={meta.touched && Boolean(meta.error)}
        helperText={
          meta.touched &&
          tErr(meta.error as TranslationKey, {
            field: title,
          })
        }
        required={required}
        disabled={loading || disabled}
        autoComplete={autoComplete}
        fullWidth
        InputProps={{
          ...InputProps,
          endAdornment: (
            <>
              {loading && <CircularProgress size={20} />}
              {helpText && <HelpButton helpText={helpText} />}
            </>
          ),
          readOnly: readOnly,
        }}
        {...rest}
      />
      {withCounter && (
        <Box sx={{ position: 'relative' }}>
          <CharacterCounter variant="caption">
            {`${field.value?.length ? field.value?.length : 0}` + (maxLength ? `/${maxLength}` : '')}
          </CharacterCounter>
        </Box>
      )}
    </>
  );
};
export default FormikInputField;
