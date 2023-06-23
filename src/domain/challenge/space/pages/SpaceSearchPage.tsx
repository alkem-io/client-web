import React, { FC } from 'react';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import SpacePageLayout from '../layout/SpacePageLayout';
import SearchView from '../../../platform/search/SearchView';
import PageContent from '../../../../core/ui/content/PageContent';
import { useResolvedPath } from 'react-router-dom';
import { useSpace } from '../SpaceContext/useSpace';
import { FilterConfig } from '../../../platform/search/Filter';
import { useTranslation } from 'react-i18next';

const journeyFilterConfig: FilterConfig = {
  all: {
    title: 'pages.search.filter.key.all',
    value: ['space', 'opportunity', 'challenge'],
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

const SpaceSearchPage: FC = () => {
  const { t } = useTranslation();

  const { spaceNameId } = useSpace();

  const { pathname } = useResolvedPath('.');

  return (
    <SpacePageLayout currentSection={EntityPageSection.Search} searchDisabled>
      <PageContent>
        <SearchView
          searchRoute={pathname}
          spaceId={spaceNameId}
          journeyFilterConfig={journeyFilterConfig}
          journeyFilterTitle={t('spaceSearch.journeyFilterTitle')}
        />
      </PageContent>
    </SpacePageLayout>
  );
};

export default SpaceSearchPage;
