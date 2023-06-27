import React, { forwardRef, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useMatch } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField';
import { Box, BoxProps, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import { useQueryParams } from '../../../../../core/routing/useQueryParams';
import { SEARCH_ROUTE, SEARCH_TERMS_PARAM } from '../../../../../domain/platform/routes/constants';

const MINIMUM_TERM_LENGTH = 2;
const getSearchTerms = (searchInput: string) => searchInput.trim();

const SearchBar = forwardRef<typeof Box, BoxProps>((props, ref) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const match = useMatch(SEARCH_ROUTE);
  const query = useQueryParams();
  const getInitialValue = () => {
    const terms = match ? query.get(SEARCH_TERMS_PARAM) : null;
    return terms ? terms.split(',').join(', ') : '';
  };
  const [value, setValue] = useState(getInitialValue);

  useLayoutEffect(() => {
    if (!match) {
      setValue('');
    }
  }, [match]);

  const isTermValid = useMemo(() => value.length < MINIMUM_TERM_LENGTH, [value]);

  const keyPressHandler = ({ code }: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTermValid) {
      return;
    }

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
    if (match && isTermValid) {
      return;
    }

    if (isTermValid) {
      return navigate(SEARCH_ROUTE);
    }

    const terms = getSearchTerms(value);
    const params = new URLSearchParams({ [SEARCH_TERMS_PARAM]: terms });
    navigate(`${SEARCH_ROUTE}?${params}`);
  }, [match, isTermValid, value, navigate]);

  return (
    <Box ref={ref} flexGrow={1} justifyContent="center" {...props}>
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
});

export default SearchBar;
