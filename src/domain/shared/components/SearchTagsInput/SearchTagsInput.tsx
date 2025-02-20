import { gutters } from '@/core/ui/grid/utils';
import { Chip, SxProps } from '@mui/material';
import Autocomplete, { AutocompleteProps, AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useCallback, useMemo } from 'react';
import uniqSortedByOccurrences from './uniqSortedByOccurrences';

export interface SearchTagsInputProps {
  value: string[];
  availableTags?: string[];
  onChange?: AutocompleteProps<string, true, undefined, true>['onChange'];
  label?: string;
  placeholder?: string;
  disableCloseOnSelect?: boolean;
  fullWidth?: boolean;
  sx?: SxProps;
}

const SearchTagsInput = ({
  value,
  availableTags = [],
  onChange,
  label,
  placeholder,
  disableCloseOnSelect = true,
  fullWidth = true,
  sx,
}: SearchTagsInputProps) => {
  const options = useMemo(() => uniqSortedByOccurrences(availableTags), [availableTags]);

  const handleChange: SearchTagsInputProps['onChange'] = (event, value, reason) => {
    const trimmedValues = value.map(x => x.trim().toLowerCase());
    onChange?.(event, trimmedValues, reason);
  };

  const renderInput = useCallback(
    (props: AutocompleteRenderInputParams) => (
      <TextField
        {...props}
        variant="outlined"
        placeholder={placeholder}
        label={label}
        sx={{
          '.MuiTextField-root input': {
            height: gutters(),
            paddingY: 0,
          },
        }}
      />
    ),
    [label, placeholder]
  );

  return (
    <Autocomplete
      aria-label="Filter"
      multiple
      fullWidth={fullWidth}
      freeSolo
      disableCloseOnSelect={disableCloseOnSelect}
      options={options}
      getOptionLabel={option => option}
      value={value}
      isOptionEqualToValue={(option, value) => option === value}
      groupBy={() => 'Tags'}
      onChange={handleChange}
      size="small"
      sx={{
        '.MuiAutocomplete-inputRoot.MuiOutlinedInput-root.MuiInputBase-sizeSmall': {
          backgroundColor: 'background.paper',
          paddingY: 0.25,
          paddingLeft: 0.25,
          '.MuiAutocomplete-input': {
            height: gutters(),
          },
        },
        ...sx,
      }}
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
