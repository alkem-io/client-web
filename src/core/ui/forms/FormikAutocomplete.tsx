import { Autocomplete, AutocompleteValue, TextField, TextFieldProps } from '@mui/material';
import { useField } from 'formik';
import React, { FC, useMemo } from 'react';
import { useValidationMessageTranslation } from '@/domain/shared/i18n/ValidationMessageTranslation';
import TranslationKey from '../../i18n/utils/TranslationKey';

export interface FormikSelectValue {
  id: string;
  name: string;
  icon?: React.ReactElement;
}

export type FormikAutocompleteProps = TextFieldProps & {
  name: string;
  values: readonly FormikSelectValue[];
  helpText?: string;
  disablePortal?: boolean;
  disabled?: boolean;
  onChange?: (value: FormikSelectValue | undefined) => void;
};

export const FormikAutocomplete: FC<FormikAutocompleteProps> = ({
  name,
  values,
  helpText,
  sx,
  disablePortal = true,
  disabled,
  onChange,
  ...textFieldProps
}) => {
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
    onChange?.(value ?? undefined);
  };

  return (
    <Autocomplete
      disablePortal={disablePortal}
      value={values.find(option => option.id === field.value) ?? null}
      options={values}
      onBlur={field.onBlur}
      onChange={handleChange}
      getOptionLabel={option => option?.name}
      sx={sx}
      disabled={disabled}
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
