import { SelectOption } from '@mui/base';
import { useTranslation } from 'react-i18next';
import React, { forwardRef, PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { useSpace } from '@/domain/journey/space/SpaceContext/useSpace';
import SearchBox from '@/core/ui/search/SearchBox';
import useNavigate from '@/core/routing/useNavigate';
import { useLocation } from 'react-router-dom';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { gutters } from '@/core/ui/grid/utils';
import { Collapsible } from '@/core/ui/navigation/Collapsible';
import { UncontrolledExpandable } from '@/core/ui/navigation/UncontrolledExpandable';
import { SEARCH_SPACE_URL_PARAM, SEARCH_TERMS_URL_PARAM } from '@/main/search/constants';
import { useCombinedRefs } from '@/domain/shared/utils/useCombinedRefs';

enum SearchScope {
  Platform,
  Space,
}

const MINIMUM_TERM_LENGTH = 2;

const getSearchTerms = (searchInput: string) => searchInput.trim();

interface PlatformSearchProps extends UncontrolledExpandable {
  compact?: boolean;
}

const PlatformSearch = forwardRef<Collapsible, PropsWithChildren<PlatformSearchProps>>(
  ({ onExpand, compact, children }, forwardedRef) => {
    const { t } = useTranslation();

    const { spaceNameId, about } = useSpace();

    const searchOptions = useMemo<Partial<SelectOption<SearchScope>>[] | undefined>(() => {
      if (!spaceNameId) {
        return undefined;
      }

      return [
        {
          value: SearchScope.Space,
          label: t('components.search.scope.space', about.profile),
        },
        {
          value: SearchScope.Platform,
          label: t('components.search.scope.platform'),
        },
      ];
    }, [t, about.profile]);

    const defaultSearchOption = spaceNameId ? SearchScope.Space : SearchScope.Platform;

    const navigate = useNavigate();
    const query = useQueryParams();
    const getInitialValue = () => {
      const terms = query.get(SEARCH_TERMS_URL_PARAM);
      return terms ? terms.split(',').join(', ') : '';
    };
    const [value, setValue] = useState(getInitialValue);

    const isTermValid = value.length >= MINIMUM_TERM_LENGTH;

    const handleValueChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
      },
      [setValue]
    );

    const searchBoxRef = useCombinedRefs(null, forwardedRef);

    const { pathname } = useLocation();

    const handleSearch = (scope: SearchScope) => {
      if (!isTermValid) {
        return;
      }
      const terms = getSearchTerms(value);
      const params = new URLSearchParams();
      params.append(SEARCH_TERMS_URL_PARAM, terms);
      if (scope === SearchScope.Space) {
        params.set(SEARCH_SPACE_URL_PARAM, spaceNameId);
      }
      setValue('');
      navigate(`${pathname}?${params}`);
      searchBoxRef?.current?.collapse();
    };

    return (
      <SearchBox
        ref={searchBoxRef}
        searchTerms={value}
        defaultSearchOption={defaultSearchOption}
        searchOptions={searchOptions}
        onChange={handleValueChange}
        onSearch={handleSearch}
        onExpand={onExpand}
        flexGrow={1}
        maxWidth={gutters(28)}
        compact={compact}
      >
        {children}
      </SearchBox>
    );
  }
);

export default PlatformSearch;
