import { TextField } from '@mui/material';
import { Autocomplete } from '@mui/material';
import { useField } from 'formik';
import React, { FC } from 'react';
import { COUNTRIES, CountryType } from '../../../models/constants';

interface CountrySelectProps {
  title?: string;
  name?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
}

// Countries are objects of the type { name: string, code: string }
const getCountryName = (option: CountryType) => option.name;

const compareCountries = (option: CountryType, value: CountryType): boolean => {
  if (option?.code === value?.code) return true;
  return false;
};

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
      getOptionLabel={getCountryName}
      isOptionEqualToValue={compareCountries}
      value={field.value}
      onChange={(event, newValue) => {
        helper.setValue(newValue);
      }}
      disabled={readOnly}
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
