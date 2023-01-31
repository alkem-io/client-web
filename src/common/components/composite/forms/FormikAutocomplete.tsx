import { Autocomplete, AutocompleteValue, TextField, TextFieldProps } from '@mui/material';
import { useField } from 'formik';
import React, { FC, useMemo } from 'react';
import { useValidationMessageTranslation } from '../../../../domain/shared/i18n/ValidationMessageTranslation';
import TranslationKey from '../../../../types/TranslationKey';

export interface FormikSelectValue {
  id: string;
  name: string;
  icon?: React.ReactElement;
}

export type FormikAutocompleteProps = TextFieldProps & {
  name: string;
  values: FormikSelectValue[];
  helpText?: string;
};

export const FormikAutocomplete: FC<FormikAutocompleteProps> = ({ name, values, helpText, sx, ...textFieldProps }) => {
  const tErr = useValidationMessageTranslation();

  const [field, meta, helpers] = useField(name);

  const isError = Boolean(meta.error);

  const helperText = useMemo(() => {
    if (!isError) {
      return helpText;
    }

    return tErr(meta.error as TranslationKey, { field: name });
  }, [isError, meta.error, helpText, name, tErr]);

  const handleChange = (
    event: React.SyntheticEvent,
    value: AutocompleteValue<FormikSelectValue | undefined, false, false, false>
  ) => {
    helpers.setValue(value?.id);
  };

  return (
    <Autocomplete
      disablePortal
      value={values.find(option => option.id === field.value) ?? null}
      options={values}
      onBlur={field.onBlur}
      onChange={handleChange}
      getOptionLabel={option => option?.name}
      sx={sx}
      renderInput={params => (
        <TextField
          variant="outlined"
          {...textFieldProps}
          {...params}
          InputLabelProps={{ shrink: true }}
          helperText={helperText}
          error={isError}
        />
      )}
    />
  );
};

export default FormikAutocomplete;
