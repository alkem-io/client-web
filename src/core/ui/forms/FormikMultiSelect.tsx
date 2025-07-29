import { Autocomplete, Chip, TextField, TextFieldProps } from '@mui/material';
import { useField } from 'formik';
import { useMemo, ReactElement, SyntheticEvent } from 'react';
import { useValidationMessageTranslation } from '@/domain/shared/i18n/ValidationMessageTranslation';
import TranslationKey from '@/core/i18n/utils/TranslationKey';

export interface FormikSelectValue {
  id: string;
  name: string;
  icon?: ReactElement;
}

export type FormikMultiSelectProps = TextFieldProps & {
  name: string;
  values: readonly FormikSelectValue[];
  helpText?: string;
  disablePortal?: boolean;
  disabled?: boolean;
  onChange?: (values: FormikSelectValue[]) => void;
  fixedOptions?: FormikSelectValue[];
};

export const FormikMultiSelect = ({
  name,
  values,
  helpText,
  sx,
  disablePortal = true,
  disabled,
  onChange,
  fixedOptions = [],
  ...textFieldProps
}: FormikMultiSelectProps) => {
  const tErr = useValidationMessageTranslation();

  const [field, meta, helpers] = useField<string[]>(name);

  const isError = Boolean(meta.error) && meta.touched;

  const helperText = useMemo(() => {
    if (!isError) {
      return helpText;
    }

    if (typeof meta.error === 'string' && meta.error.indexOf('must have at least') !== -1) {
      return tErr('forms.validations.required');
    }

    return tErr(meta.error as TranslationKey, { field: name });
  }, [isError, meta.error, helpText, name, tErr]);

  const selectedValues = useMemo(() => {
    const fieldSelectedValues = values.filter(option => field.value?.includes(option.id)) ?? [];
    // Ensure fixed options are always included in selected values
    const allFixedOptions = fixedOptions.filter(
      option => !fieldSelectedValues.some(selected => selected.id === option.id)
    );
    return [...fieldSelectedValues, ...allFixedOptions];
  }, [values, field.value, fixedOptions]);

  const handleChange = (event: SyntheticEvent, newValues: FormikSelectValue[]) => {
    // Filter out fixed options from the change since they should always be present
    const removableValues = newValues.filter(value => !fixedOptions.some(fixed => fixed.id === value.id));
    const allValues = [...fixedOptions, ...removableValues];
    const selectedIds = allValues.map(value => value.id);
    helpers.setValue(selectedIds);
    onChange?.(allValues);
  };

  return (
    <Autocomplete
      multiple
      disablePortal={disablePortal}
      value={selectedValues}
      options={values}
      onBlur={e => {
        helpers.setTouched(true);
        field.onBlur(e);
      }}
      onChange={handleChange}
      getOptionLabel={option => option?.name}
      sx={sx}
      disabled={disabled}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          const isFixed = fixedOptions.some(fixed => fixed.id === option.id);

          return (
            <Chip
              variant="outlined"
              label={option.name}
              {...getTagProps({ index })}
              disabled={isFixed}
              onDelete={isFixed ? undefined : getTagProps({ index }).onDelete}
            />
          );
        })
      }
      renderInput={params => (
        <TextField
          variant="outlined"
          {...textFieldProps}
          {...params}
          InputLabelProps={{ shrink: true }}
          helperText={Boolean(helperText) ? <>{helperText}</> : null}
          error={isError}
        />
      )}
    />
  );
};

export default FormikMultiSelect;
