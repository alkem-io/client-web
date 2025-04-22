import { ChangeEvent, forwardRef } from 'react';
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  FormHelperText,
  OutlinedTextFieldProps,
  TextField,
  TextFieldProps,
} from '@mui/material';
import HelpButton from '@/core/ui/button/HelpButton';

const DEFAULT_MIN_LENGTH = 2;

// TODO: Do we really need to extend from OutlinedTextFieldProps?
type TagsInputProps = Omit<OutlinedTextFieldProps, 'onChange'> & {
  onChange?: (tags: (string | string[])[]) => void;
  onBlur?: TextFieldProps['onBlur'];
  minLength?: number;
  error?: boolean;
  value: string[];
  readOnly?: boolean;
  disabled?: boolean;
  helpTextIcon?: string;
  loading?: boolean;
};

export const TagsInput = forwardRef(
  (
    {
      onChange,
      onBlur,
      minLength = DEFAULT_MIN_LENGTH,
      error,
      value,
      placeholder,
      readOnly,
      disabled,
      helpTextIcon,
      helperText,
      loading,
      ...rest
    }: TagsInputProps,
    ref
  ) => {
    const handleChange = (e: ChangeEvent<{}>, newValue: (string | string[])[]) => {
      const changedValues = newValue.map(x => (Array.isArray(x) ? x : x.trim())).filter(x => x.length >= minLength);
      onChange && onChange(changedValues);
    };

    return (
      <>
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
                sx={{ borderColor: 'primary.main' }}
                size="small"
                key={index} // Unnecessary but avoids a console warning
              />
            ))
          }
          renderInput={params => (
            <TextField
              {...params}
              {...rest}
              error={error}
              variant="outlined"
              onBlur={onBlur}
              InputProps={{
                ...params.InputProps,
                endAdornment: helpTextIcon && (
                  <Box sx={{ marginRight: '5px', display: 'flex' }}>
                    {loading && <CircularProgress size={20} />}
                    <HelpButton helpText={helpTextIcon} />
                  </Box>
                ),
              }}
            />
          )}
        />
        {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
      </>
    );
  }
);

export default TagsInput;
