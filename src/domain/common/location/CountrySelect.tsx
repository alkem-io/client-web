import { Autocomplete, TextField } from '@mui/material';
import { useField } from 'formik';
import { COUNTRIES, type CountryType } from './countries.constants';

type CountrySelectProps = {
  title?: string;
  name?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
};

const getCountryName = (option: CountryType) => option.name;
const compareCountries = (option: CountryType, value: CountryType) => option?.code === value?.code;

export const CountrySelect = ({
  title = 'Country',
  name = 'country',
  required,
  readOnly,
  disabled,
}: CountrySelectProps) => {
  const [field, meta, helper] = useField(name);

  return (
    <Autocomplete
      autoHighlight={true}
      options={COUNTRIES}
      getOptionLabel={getCountryName}
      isOptionEqualToValue={compareCountries}
      value={field.value}
      onChange={(_event, newValue) => {
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
      fullWidth={true}
    />
  );
};

export default CountrySelect;
