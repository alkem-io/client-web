import React, { FC, useMemo } from 'react';
import { useField } from 'formik';
import { FormHelperText, TextField, TextFieldProps } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress/CircularProgress';
import { DistributiveOmit } from '@mui/types';
import TranslationKey from '../../../../types/TranslationKey';
import { useValidationMessageTranslation } from '../../../../domain/shared/i18n/ValidationMessageTranslation';
import HelpButton from '../../core/HelpButton';
import CharacterCounter from '../common/CharacterCounter/CharacterCounter';
import FileUploadButton from '../common/FileUpload/FileUpload';

type InputFieldProps = DistributiveOmit<TextFieldProps, 'variant'> & {
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
  attachFile?: boolean;
};

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
  helpIconText,
  helperText: _helperText,
  loading,
  rows,
  withCounter,
  maxLength,
  attachFile = false,
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
    <>
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
              {attachFile && <FileUploadButton onUpload={helpers.setValue} />}
            </>
          ),
          readOnly: readOnly,
        }}
        {...rest}
      />
      {withCounter && <CharacterCounter count={field.value?.length} maxLength={maxLength} />}
      <FormHelperText sx={{ width: '95%' }} error={isError}>
        {helperText}
      </FormHelperText>
    </>
  );
};
export default FormikInputField;
