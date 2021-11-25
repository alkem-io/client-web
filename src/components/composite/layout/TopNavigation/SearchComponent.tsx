import * as React from 'react';
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField';
import { InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchComponent = () => {
  const { t } = useTranslation();

  return (
    <TextField
      aria-label="Search"
      placeholder={t('common.search')}
      margin="dense"
      sx={{
        padding: 0,
        margin: 0,
        width: '100%',
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        size: 'small',
      }}
      variant="outlined"
    />
  );
};
export default SearchComponent;
