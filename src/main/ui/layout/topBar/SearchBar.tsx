import React, { useCallback, useMemo, useState } from 'react';
import useNavigate from '@/core/routing/useNavigate';
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField';
import { Box, BoxProps, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { SEARCH_TERMS_URL_PARAM } from '@/main/search/constants';
import { useLocation } from 'react-router-dom';

const MINIMUM_TERM_LENGTH = 2;
const getSearchTerms = (searchInput: string) => searchInput.trim();

const SearchBar = ({ ref, ...props }: BoxProps & { withRedirect?: boolean } & { ref?: React.Ref<typeof Box> }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const query = useQueryParams();

  const getInitialValue = () => {
    const terms = query.get(SEARCH_TERMS_URL_PARAM);
    return terms ? terms.split(',').join(', ') : '';
  };
  const [value, setValue] = useState(getInitialValue);

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
    const terms = getSearchTerms(value);
    const params = new URLSearchParams({ [SEARCH_TERMS_URL_PARAM]: terms });
    if (props.withRedirect) {
      // eslint-disable-next-line react-compiler/react-compiler -- window.location assignment is standard navigation
      window.location.href = `/?${params}`;
    } else {
      navigate(`${pathname}?${params}`);
    }
  }, [isTermValid, value, navigate, props.withRedirect]);

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
              <IconButton onClick={handleNavigateToSearchPage} aria-label={t('common.search')}>
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
