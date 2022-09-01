import React, { FC } from 'react';
import OrganizationPageContainer from '../../containers/organization/OrganizationPageContainer';
import OrganizationPageLayout from '../../domain/organization/layout/OrganizationPageLayout';
import OrganizationPageView from '../../domain/organization/views/OrganizationPageView';
import { EntityPageSection } from '../../domain/shared/layout/EntityPageSection';
import { useUpdateNavigation } from '../../hooks';
import { PageProps } from '../common';

interface OrganizationPageProps extends PageProps {}

export const OrganizationPage: FC<OrganizationPageProps> = ({ paths }) => {
  useUpdateNavigation({ currentPaths: paths });

  return (
    <OrganizationPageLayout currentSection={EntityPageSection.Dashboard}>
      <OrganizationPageContainer>
        {(entities, state) => {
          return <OrganizationPageView entities={entities} state={state} />;
        }}
      </OrganizationPageContainer>
    </OrganizationPageLayout>
  );
};
export default OrganizationPage;
