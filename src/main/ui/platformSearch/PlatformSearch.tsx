import { SelectOption } from '@mui/base/SelectUnstyled/useSelect.types';
import { useTranslation } from 'react-i18next';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useSpace } from '../../../domain/journey/space/SpaceContext/useSpace';
import SearchBox from '../../../core/ui/search/SearchBox';
import { useNavigate } from 'react-router';
import { useMatch } from 'react-router-dom';
import { SEARCH_ROUTE, SEARCH_TERMS_PARAM } from '../../../domain/platform/routes/constants';
import { useQueryParams } from '../../../core/routing/useQueryParams';
import { buildSpaceUrl } from '../../routing/urlBuilders';

enum SearchScope {
  Platform,
  Space,
}

const MINIMUM_TERM_LENGTH = 2;

const getSearchTerms = (searchInput: string) => searchInput.trim();

const PlatformSearch = () => {
  const { t } = useTranslation();

  const { spaceNameId, profile } = useSpace();

  const searchOptions = useMemo<SelectOption<SearchScope>[] | undefined>(() => {
    if (!spaceNameId) {
      return undefined;
    }

    return [
      {
        value: SearchScope.Space,
        label: t('components.search.scope.space', profile),
      },
      {
        value: SearchScope.Platform,
        label: t('components.search.scope.platform'),
      },
    ];
  }, [t, profile]);

  const defaultSearchOption = spaceNameId ? SearchScope.Space : SearchScope.Platform;

  // search terms

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

  // eof st

  const spaceSearchRoute = `${buildSpaceUrl(spaceNameId)}/search`;

  const handleSpaceSearch = (terms: string[]) => {
    const params = new URLSearchParams();
    for (const term of terms) {
      params.append(SEARCH_TERMS_PARAM, term);
    }
    navigate(`${spaceSearchRoute}?${params}`);
  };

  const handleSearch = (scope: SearchScope) => {
    switch (scope) {
      case SearchScope.Platform: {
        return handleNavigateToSearchPage();
      }
      case SearchScope.Space: {
        return handleSpaceSearch([getSearchTerms(value)]);
      }
    }
  };

  return (
    <SearchBox
      searchTerms={value}
      defaultSearchOption={defaultSearchOption}
      searchOptions={searchOptions}
      onChange={handleValueChange}
      onSearch={handleSearch}
    />
  );
};

export default PlatformSearch;
