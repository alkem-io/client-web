import React, { FC } from 'react';
import { Chip } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete/Autocomplete';
import TextField from '@mui/material/TextField/TextField';

export interface SearchComponentProps {
  placeholder?: string;
  multiple?: boolean;
  fullWidth?: boolean;
  freeSolo?: boolean;
  disableCloseOnSelect?: boolean;
  size?: 'small' | 'medium';
  onChange?: (terms: string[]) => void;
}

const SearchComponent: FC<SearchComponentProps> = ({
  placeholder,
  fullWidth = true,
  freeSolo = true,
  multiple = true,
  disableCloseOnSelect = true,
  size = 'small',
  onChange,
}) => {
  const handleChange = (e, value: string[] | string | null) => {
    if (!value) {
      return;
    }

    const termsArray: string[] = [];

    if (Array.isArray(value)) {
      const trimmedValues = value.map(x => x.trim().toLowerCase());
      termsArray.push(...trimmedValues);
    } else {
      termsArray.push(value);
    }

    if (onChange) {
      onChange(termsArray);
    }
  };
  return (
    <Autocomplete
      aria-label="Filter"
      id="card-filter"
      multiple={multiple}
      fullWidth={fullWidth}
      freeSolo={freeSolo}
      disableCloseOnSelect={disableCloseOnSelect}
      options={[]}
      size={size}
      onChange={handleChange}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip color="primary" variant="outlined" label={option} {...getTagProps({ index })} />
        ))
      }
      renderInput={params => <TextField {...params} margin="none" variant="outlined" placeholder={placeholder} />}
    />
  );
};
export default SearchComponent;
