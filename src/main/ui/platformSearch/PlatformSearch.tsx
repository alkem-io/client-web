import { SelectOption } from '@mui/base/SelectUnstyled/useSelect.types';
import { useTranslation } from 'react-i18next';
import React, { forwardRef, PropsWithChildren, useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useSpace } from '../../../domain/journey/space/SpaceContext/useSpace';
import SearchBox from '../../../core/ui/search/SearchBox';
import { useNavigate } from 'react-router';
import { useMatch } from 'react-router-dom';
import { SEARCH_ROUTE, SEARCH_TERMS_PARAM } from '../../../domain/platform/routes/constants';
import { useQueryParams } from '../../../core/routing/useQueryParams';
import { buildSpaceUrl } from '../../routing/urlBuilders';
import { gutters } from '../../../core/ui/grid/utils';
import { Collapsible } from '../../../core/ui/navigation/Collapsible';
import { UncontrolledExpandable } from '../../../core/ui/navigation/UncontrolledExpandable';

enum SearchScope {
  Platform,
  Space,
}

const MINIMUM_TERM_LENGTH = 2;

const getSearchTerms = (searchInput: string) => searchInput.trim();

interface PlatformSearchProps extends UncontrolledExpandable {}

const PlatformSearch = forwardRef<Collapsible, PropsWithChildren<PlatformSearchProps>>(
  ({ onExpand, children }, ref) => {
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

    // The code below is taken from the old SearchBar
    // TODO refactor when there are no bigger priorities

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

    const handlePlatformSearch = useCallback(() => {
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
          return handlePlatformSearch();
        }
        case SearchScope.Space: {
          return handleSpaceSearch([getSearchTerms(value)]);
        }
      }
    };

    return (
      <SearchBox
        ref={ref}
        searchTerms={value}
        defaultSearchOption={defaultSearchOption}
        searchOptions={searchOptions}
        onChange={handleValueChange}
        onSearch={handleSearch}
        onExpand={onExpand}
        flexGrow={1}
        maxWidth={gutters(28)}
      >
        {children}
      </SearchBox>
    );
  }
);

export default PlatformSearch;
