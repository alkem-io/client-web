import { Chip, OutlinedTextFieldProps, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React, { ChangeEvent, FC, forwardRef } from 'react';

type TagsInputProps = Omit<OutlinedTextFieldProps, 'onChange'> & {
  onChange?: (tags: (string | string[])[]) => void;
  value: string[];
};

export const TagsInput: FC<TagsInputProps> = forwardRef(
  ({ InputProps, onChange, value, placeholder, ...rest }, ref) => {
    const handleChange = (e: ChangeEvent<{}>, newValue: (string | string[])[]) => {
      const changedValues = newValue.filter(x => x.length >= 2);
      onChange && onChange(changedValues);
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
