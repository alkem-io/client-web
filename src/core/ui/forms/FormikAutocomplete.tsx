import { Autocomplete, type AutocompleteValue, TextField, type TextFieldProps } from '@mui/material';
import { useField } from 'formik';
import type { ReactElement, SyntheticEvent } from 'react';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import { useValidationMessageTranslation } from '@/domain/shared/i18n/ValidationMessageTranslation';

export interface FormikSelectValue {
  id: string;
  name: string;
  icon?: ReactElement;
}

export type FormikAutocompleteProps = TextFieldProps & {
  name: string;
  values: readonly FormikSelectValue[];
  helpText?: string;
  disablePortal?: boolean;
  disabled?: boolean;
  onChange?: (value: FormikSelectValue | undefined) => void;
};

export const FormikAutocomplete = ({
  name,
  values,
  helpText,
  sx,
  disablePortal = true,
  disabled,
  onChange,
  ...textFieldProps
}: FormikAutocompleteProps) => {
  const tErr = useValidationMessageTranslation();

  const [field, meta, helpers] = useField(name);

  const isError = Boolean(meta.error) && meta.touched;

  const helperText = (() => {
    if (!isError) {
      return helpText;
    }

    return tErr(meta.error as TranslationKey, { field: name });
  })();

  const handleChange = (
    _event: SyntheticEvent,
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
      onBlur={e => {
        helpers.setTouched(true);
        field.onBlur(e);
      }}
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
          helperText={helperText ? helperText : null}
          error={isError}
        />
      )}
    />
  );
};

export default FormikAutocomplete;
