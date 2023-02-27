import React, { FC } from 'react';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import HubPageLayout from '../layout/HubPageLayout';
import SearchView from '../../../platform/search/SearchView';
import PageContent from '../../../../core/ui/content/PageContent';
import { useResolvedPath } from 'react-router-dom';
import { useHub } from '../HubContext/useHub';

const HubSearchPage: FC = () => {
  const { hubNameId } = useHub();

  const { pathname } = useResolvedPath('.');

  return (
    <HubPageLayout currentSection={EntityPageSection.Search} searchDisabled>
      <PageContent>
        <SearchView searchRoute={pathname} hubId={hubNameId} />
      </PageContent>
    </HubPageLayout>
  );
};

export default HubSearchPage;
