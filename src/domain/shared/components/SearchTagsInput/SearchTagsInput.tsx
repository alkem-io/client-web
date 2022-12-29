import React, { useCallback, useMemo } from 'react';
import Autocomplete, { AutocompleteProps, AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Chip } from '@mui/material';
import uniqSortedByOccurrences from './uniqSortedByOccurrences';

export type ValueType = {
  id: string;
  values: string[];
};

export interface SearchTagsInputProps {
  value: string[];
  availableTags?: string[];
  onChange?: AutocompleteProps<string, true, undefined, true>['onChange'];
  label?: string;
  placeholder?: string;
  disableCloseOnSelect?: boolean;
}

const SearchTagsInput = ({
  value,
  availableTags = [],
  onChange,
  label,
  placeholder,
  disableCloseOnSelect = true,
}: SearchTagsInputProps) => {
  const options = useMemo(() => uniqSortedByOccurrences(availableTags), [availableTags]);

  const handleChange: SearchTagsInputProps['onChange'] = (event, value, reason) => {
    const trimmedValues = value.map(x => x.trim().toLowerCase());
    onChange?.(event, trimmedValues, reason);
  };

  const renderInput = useCallback(
    (props: AutocompleteRenderInputParams) => (
      <TextField {...props} variant="outlined" placeholder={placeholder} label={label} />
    ),
    [label, placeholder]
  );

  return (
    <Autocomplete
      aria-label="Filter"
      id="card-filter"
      placeholder={placeholder}
      multiple
      fullWidth
      freeSolo
      disableCloseOnSelect={disableCloseOnSelect}
      options={options}
      getOptionLabel={option => option}
      value={value}
      isOptionEqualToValue={(option, value) => option === value}
      groupBy={() => 'Tags'}
      onChange={handleChange}
      sx={{ '.MuiAutocomplete-inputRoot': { backgroundColor: 'background.paper' } }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip color="primary" variant="outlined" label={option} {...getTagProps({ index })} />
        ))
      }
      renderInput={renderInput}
    />
  );
};

export default SearchTagsInput;
