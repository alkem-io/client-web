import React, { FC, useLayoutEffect, useRef } from 'react';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import HubPageLayout from '../layout/HubPageLayout';
import SearchView from '../../../platform/search/SearchView';
import PageContent from '../../../../core/ui/content/PageContent';
import { useResolvedPath } from 'react-router-dom';
import { useHub } from '../HubContext/useHub';
import { FilterConfig } from '../../../platform/pages/Search/Filter';
import { useTranslation } from 'react-i18next';
import { useSearchContext } from '../../../platform/search/SearchContext';

const journeyFilterConfig: FilterConfig = {
  all: {
    title: 'pages.search.filter.key.all',
    value: ['hub', 'opportunity', 'challenge'],
    typename: 'all',
  },
  challenge: {
    title: 'pages.search.filter.key.challenge',
    value: ['challenge'],
    typename: 'challenge',
  },
  opportunity: {
    title: 'pages.search.filter.key.opportunity',
    value: ['opportunity'],
    typename: 'opportunity',
  },
};

const HubSearchPage: FC = () => {
  const { t } = useTranslation();

  const { hubNameId } = useHub();

  const { pathname } = useResolvedPath('.');

  const { isSearchOpen, closeSearch } = useSearchContext();

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useLayoutEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen, closeSearch]);

  return (
    <HubPageLayout currentSection={EntityPageSection.Search} searchDisabled>
      <PageContent>
        <SearchView
          searchRoute={pathname}
          hubId={hubNameId}
          journeyFilterConfig={journeyFilterConfig}
          journeyFilterTitle={t('hubSearch.journeyFilterTitle')}
          searchInputProps={{
            inputRef: searchInputRef,
            onBlur: closeSearch,
          }}
        />
      </PageContent>
    </HubPageLayout>
  );
};

export default HubSearchPage;
