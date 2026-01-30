import { useTranslation } from 'react-i18next';
import React, { PropsWithChildren, useState } from 'react';
import { useSpace } from '@/domain/space/context/useSpace';
import SearchBox from '@/core/ui/search/SearchBox';
import useNavigate from '@/core/routing/useNavigate';
import { useLocation } from 'react-router-dom';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { gutters } from '@/core/ui/grid/utils';
import { Collapsible } from '@/core/ui/navigation/Collapsible';
import { UncontrolledExpandable } from '@/core/ui/navigation/UncontrolledExpandable';
import { SEARCH_SPACE_URL_PARAM, SEARCH_TERMS_URL_PARAM } from '@/main/search/constants';
import { useCombinedRefs } from '@/domain/shared/utils/useCombinedRefs';

export enum SearchScope {
  Platform,
  Space,
}

interface SearchOption {
  value: SearchScope;
  label: string;
}

const MINIMUM_TERM_LENGTH = 2;

const getSearchTerms = (searchInput: string) => searchInput.trim();

interface PlatformSearchProps extends UncontrolledExpandable {
  compact?: boolean;
}

const PlatformSearch = ({
  ref: forwardedRef,
  onExpand,
  compact,
  children,
}: PropsWithChildren<PlatformSearchProps> & {
  ref?: React.Ref<Collapsible>;
}) => {
  const { t } = useTranslation();

  const { space } = useSpace();
  const { about } = space;

  const searchOptions: SearchOption[] | undefined = !space || !space.nameID
      ? undefined
      : [
          {
            value: SearchScope.Space,
            label: t('components.search.scope.space', about.profile),
          },
          {
            value: SearchScope.Platform,
            label: t('components.search.scope.platform'),
          },
        ];

  const defaultSearchOption = space.nameID ? SearchScope.Space : SearchScope.Platform;

  const navigate = useNavigate();
  const query = useQueryParams();
  const getInitialValue = () => {
    const terms = query.get(SEARCH_TERMS_URL_PARAM);
    return terms ? terms.split(',').join(', ') : '';
  };
  const [value, setValue] = useState(getInitialValue);

  const isTermValid = value.length >= MINIMUM_TERM_LENGTH;

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

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
      params.set(SEARCH_SPACE_URL_PARAM, space.nameID);
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
};

export default PlatformSearch;
