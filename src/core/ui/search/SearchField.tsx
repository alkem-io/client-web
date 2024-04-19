import React from 'react';
import { IconButton, InputAdornment, TextField, TextFieldProps } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

type SearchFieldProps = TextFieldProps & {
  onSearch?: (value: string) => void;
};

const SearchField = ({ onSearch, ...props }: SearchFieldProps) => {
  const { t } = useTranslation();
  const defaults: TextFieldProps = {
    placeholder: t('common.search'),
    fullWidth: true,
    variant: 'outlined',
    size: 'small',
  };

  return (
    <TextField
      {...defaults}
      {...props}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => onSearch}>
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        ),
        ...props.InputProps,
      }}
    />
  );
};

export default SearchField;
