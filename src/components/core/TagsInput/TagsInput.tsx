import { FiberManualRecord } from '@mui/icons-material';
import { Autocomplete, Chip, OutlinedTextFieldProps, TextField } from '@mui/material';
import { isArray } from 'lodash';
import React, { ChangeEvent, FC, forwardRef } from 'react';

const DEFAULT_MIN_LENGHT = 2;

// TODO: Do we realy need to extend from OutlinedTextFieldProps?
type TagsInputProps = Omit<OutlinedTextFieldProps, 'onChange'> & {
  onChange?: (tags: (string | string[])[]) => void;
  minLength?: number;
  error?: boolean;
  value: string[];
  readOnly?: boolean;
  disabled?: boolean;
};

export const TagsInput: FC<TagsInputProps> = forwardRef(
  ({ onChange, minLength = DEFAULT_MIN_LENGHT, error, value, placeholder, readOnly, disabled, ...rest }, ref) => {
    const handleChange = (e: ChangeEvent<{}>, newValue: (string | string[])[]) => {
      const changedValues = newValue.map(x => (isArray(x) ? x : x.trim())).filter(x => x.length >= minLength);
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
        disabled={readOnly || disabled}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              color="primary"
              variant="outlined"
              label={option}
              {...getTagProps({ index })}
              size="small"
              icon={<FiberManualRecord />}
            />
          ))
        }
        renderInput={params => <TextField {...params} {...rest} error={error} variant="outlined" />}
      />
    );
  }
);

export default TagsInput;
