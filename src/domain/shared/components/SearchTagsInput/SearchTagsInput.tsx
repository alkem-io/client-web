import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Autocomplete, { AutocompleteProps, AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Chip } from '@mui/material';
import Box from '@mui/material/Box';
import uniqSortedByOccurrences from './uniqSortedByOccurrences';

export type ValueType = {
  id: string;
  values: string[];
};

export interface CardFilterInputProps {
  value: string[];
  onChange?: AutocompleteProps<string, true, undefined, true>['onChange'];
  placeholder?: string;
}

const SearchTagsInput = ({ value, onChange, placeholder }: CardFilterInputProps) => {
  const { t } = useTranslation();

  const options = useMemo(() => uniqSortedByOccurrences(value), [value]);

  const handleChange: CardFilterInputProps['onChange'] = (event, value, reason) => {
    const trimmedValues = value.map(x => x.trim().toLowerCase());
    onChange?.(event, trimmedValues, reason);
  };

  const renderInput = useCallback(
    (props: AutocompleteRenderInputParams) => (
      <TextField {...props} variant="outlined" placeholder={placeholder} label={t('components.card-filter.title')} />
    ),
    [placeholder]
  );

  return (
    <Box paddingBottom={2}>
      <Autocomplete
        aria-label="Filter"
        id="card-filter"
        placeholder={placeholder}
        multiple
        fullWidth
        freeSolo
        disableCloseOnSelect
        options={options}
        getOptionLabel={option => option}
        isOptionEqualToValue={(option, value) => option === value}
        groupBy={() => 'Tags'}
        onChange={handleChange}
        sx={{ backgroundColor: 'white' }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip color="primary" variant="outlined" label={option} {...getTagProps({ index })} />
          ))
        }
        renderInput={renderInput}
      />
    </Box>
  );
};

export default SearchTagsInput;
