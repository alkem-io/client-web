import { Chip, OutlinedTextFieldProps, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React, { FC, forwardRef } from 'react';

type TagsInputProps = Omit<OutlinedTextFieldProps, 'onChange'> & {
  onChange?: (tags: string[]) => void;
  value: string[];
};

export const TagsInput: FC<TagsInputProps> = forwardRef(
  ({ InputProps, onChange, value, placeholder, ...rest }, ref) => {
    const handleChange = (e, newValue) => {
      onChange && onChange(newValue);
    };

    return (
      <Autocomplete
        ref={ref}
        aria-label="Filter"
        id="card-filter"
        multiple
        fullWidth
        freeSolo
        autoSelect
        disableCloseOnSelect
        options={[]}
        value={value}
        onChange={handleChange}
        disableClearable
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip variant="outlined" label={option} {...getTagProps({ index })} size="small" />
          ))
        }
        renderInput={params => <TextField {...params} {...rest} variant="outlined" />}
      />
    );
  }
);

export default TagsInput;
