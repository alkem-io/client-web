import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { useField } from 'formik';
import React, { FC } from 'react';
import { COUNTRIES } from '../../../models/constants';

interface CountrySelectProps {
  title?: string;
  name?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
}

export const CountrySelect: FC<CountrySelectProps> = ({
  title = 'Country',
  name = 'country',
  required,
  readOnly,
  disabled,
}) => {
  const [field, meta, helper] = useField(name);

  return (
    <Autocomplete
      autoHighlight
      options={COUNTRIES}
      getOptionLabel={option => option.name}
      value={field.value}
      onChange={(event, newValue) => {
        helper.setValue(newValue);
      }}
      renderInput={params => (
        <TextField
          {...params}
          label={title}
          variant={'outlined'}
          InputLabelProps={{ shrink: true }}
          required={required}
          disabled={disabled}
          error={meta.touched && Boolean(meta.error)}
          helperText={meta.error}
          inputProps={{
            ...params.inputProps,
            readOnly: readOnly,
            autoComplete: 'new-password',
          }}
        />
      )}
      fullWidth
    />
  );
};
export default CountrySelect;
