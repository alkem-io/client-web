import React, { useCallback, useLayoutEffect, useState } from 'react';
import { useMatch } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField';
import { Box, InputAdornment, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import { useQueryParams } from '../../../../../hooks';

const SEARCH_ROUTE = '/search';
const SEARCH_TERMS_PARAM = 'terms';
const getSearchTerms = (searchInput: string) => searchInput.split(' ').join(',');

const SearchBar = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const match = useMatch(SEARCH_ROUTE);
  const query = useQueryParams();
  const getInitialValue = () => {
    const terms = match ? query.get(SEARCH_TERMS_PARAM) : null;
    return terms ? terms.split(',').join(' ') : '';
  };
  const [value, setValue] = useState(getInitialValue);

  useLayoutEffect(() => {
    if (match && query.get(SEARCH_TERMS_PARAM) === getSearchTerms(value)) {
      return;
    }
    setValue('');
  }, [match, query]);

  const keyPressHandler = ({ code }: React.KeyboardEvent<HTMLDivElement>) => {
    if (code === 'Enter' || code === 'NumpadEnter') {
      handleNavigateToSearchPage();
    }
  };

  const handleValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
    },
    [setValue]
  );

  const handleNavigateToSearchPage = useCallback(() => {
    const terms = getSearchTerms(value);
    const params = new URLSearchParams({ [SEARCH_TERMS_PARAM]: terms });
    navigate(`${SEARCH_ROUTE}?${params}`, { replace: true });
  }, [value, SEARCH_ROUTE, SEARCH_TERMS_PARAM]);

  return (
    <Box
      flexGrow={1}
      justifyContent="center"
      sx={{
        display: {
          xs: 'none',
          md: 'block',
        },
        width: {
          md: theme.spacing(15),
          lg: theme.spacing(35),
          xl: theme.spacing(42),
        },
      }}
    >
      <TextField
        value={value}
        onChange={handleValueChange}
        aria-label="Search"
        placeholder={t('common.search')}
        margin="dense"
        onKeyPress={keyPressHandler}
        sx={{
          padding: 0,
          margin: 0,
          width: '100%',
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleNavigateToSearchPage}>
                <SearchIcon color="primary" />
              </IconButton>
            </InputAdornment>
          ),
          size: 'small',
          sx: { paddingRight: '4px' },
        }}
        variant="outlined"
      />
    </Box>
  );
};
export default SearchBar;
