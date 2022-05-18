import { FiberManualRecord } from '@mui/icons-material';
import { Autocomplete, Chip, OutlinedTextFieldProps, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import React, { ChangeEvent, FC, forwardRef } from 'react';
import HelpButton from '../HelpButton';
import CircularProgress from '@mui/material/CircularProgress';

const DEFAULT_MIN_LENGTH = 2;

// TODO: Do we realy need to extend from OutlinedTextFieldProps?
type TagsInputProps = Omit<OutlinedTextFieldProps, 'onChange'> & {
  onChange?: (tags: (string | string[])[]) => void;
  minLength?: number;
  error?: boolean;
  value: string[];
  readOnly?: boolean;
  disabled?: boolean;
  helpText?: string;
  loading?: boolean;
};

export const TagsInput: FC<TagsInputProps> = forwardRef(
  (
    {
      onChange,
      minLength = DEFAULT_MIN_LENGTH,
      error,
      value,
      placeholder,
      readOnly,
      disabled,
      helpText,
      loading,
      ...rest
    },
    ref
  ) => {
    const handleChange = (e: ChangeEvent<{}>, newValue: (string | string[])[]) => {
      const changedValues = newValue.map(x => (Array.isArray(x) ? x : x.trim())).filter(x => x.length >= minLength);
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
        disabled={loading || readOnly || disabled}
        sx={{
          ':root': {
            padding: 14,
          },
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              color="primary"
              variant="outlined"
              label={option}
              {...getTagProps({ index })}
              sx={{ borderColor: '#068293' }}
              size="small"
              icon={<FiberManualRecord />}
            />
          ))
        }
        renderInput={params => (
          <TextField
            {...params}
            {...rest}
            error={error}
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: helpText && (
                <Box sx={{ marginRight: '5px', display: 'flex' }}>
                  {loading && <CircularProgress size={20} />}
                  <HelpButton helpText={helpText} />
                </Box>
              ),
            }}
          />
        )}
      />
    );
  }
);

export default TagsInput;
