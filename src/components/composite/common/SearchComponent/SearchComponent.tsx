import React, { FC, useState } from 'react';
import { Chip } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete/Autocomplete';
import TextField from '@mui/material/TextField/TextField';

export interface ChallengeSearchProps {
  placeholder?: string;
  multiple?: boolean;
  fullWidth?: boolean;
  freeSolo?: boolean;
  disableCloseOnSelect?: boolean;
  children: (terms: string[]) => React.ReactNode;
}

const SearchComponent: FC<ChallengeSearchProps> = ({
  placeholder,
  fullWidth = true,
  freeSolo = true,
  multiple = true,
  disableCloseOnSelect = true,
  children,
}) => {
  const [terms, setTerms] = useState<string[]>([]);

  const handleChange = (e, value: string[] | string | null) => {
    if (!value) {
      return;
    }

    if (Array.isArray(value)) {
      const trimmedValues = value.map(x => x.trim().toLowerCase());
      setTerms(trimmedValues);
    } else {
      setTerms([value]);
    }
  };
  return (
    <>
      <Autocomplete
        aria-label="Filter"
        id="card-filter"
        multiple={multiple}
        fullWidth={fullWidth}
        freeSolo={freeSolo}
        disableCloseOnSelect={disableCloseOnSelect}
        options={[]}
        onChange={handleChange}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip color="primary" variant="outlined" label={option} {...getTagProps({ index })} />
          ))
        }
        renderInput={params => (
          <TextField
            {...params}
            margin="none"
            variant="outlined"
            placeholder={placeholder}
          />
        )}
      />
      {children(terms)}
    </>
  );
};
export default SearchComponent;
