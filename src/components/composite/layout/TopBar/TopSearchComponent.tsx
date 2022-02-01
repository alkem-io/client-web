import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField';
import { InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const TopSearchComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [value, setValue] = useState<String>('');

  const keyPressHandler = ({ code }: React.KeyboardEvent<HTMLDivElement>) => {
    if (code === 'Enter' || code === 'NumpadEnter') {
      const terms = value.split(' ').join(',');
      navigate(`/search?terms=${terms}`, { replace: true });
    }
  };

  return (
    <TextField
      aria-label="Search"
      placeholder={t('common.search')}
      onChange={e => setValue(e.target.value)}
      margin="dense"
      onKeyPress={keyPressHandler}
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
export default TopSearchComponent;
