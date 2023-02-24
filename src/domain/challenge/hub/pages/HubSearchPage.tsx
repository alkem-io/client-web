import React, { FC } from 'react';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import HubPageLayout from '../layout/HubPageLayout';
import SearchView from '../../../platform/search/SearchView';
import PageContent from '../../../../core/ui/content/PageContent';
import { useResolvedPath } from 'react-router-dom';

const HubSearchPage: FC = () => {
  // const { hubNameId, displayName, communityId } = useHub();

  const { pathname } = useResolvedPath('.');

  return (
    <HubPageLayout currentSection={EntityPageSection.Search} searchDisabled>
      <PageContent>
        <SearchView searchRoute={pathname} />
      </PageContent>
    </HubPageLayout>
  );
};

export default HubSearchPage;
