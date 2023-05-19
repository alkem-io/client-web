import React, { FC } from 'react';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import HubPageLayout from '../layout/HubPageLayout';
import SearchView from '../../../platform/search/SearchView';
import PageContent from '../../../../core/ui/content/PageContent';
import { useResolvedPath } from 'react-router-dom';
import { useHub } from '../HubContext/useHub';
import { FilterConfig } from '../../../platform/search/Filter';
import { useTranslation } from 'react-i18next';

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

  return (
    <HubPageLayout currentSection={EntityPageSection.Search} searchDisabled>
      <PageContent>
        <SearchView
          searchRoute={pathname}
          hubId={hubNameId}
          journeyFilterConfig={journeyFilterConfig}
          journeyFilterTitle={t('hubSearch.journeyFilterTitle')}
        />
      </PageContent>
    </HubPageLayout>
  );
};

export default HubSearchPage;
