import React, { FC } from 'react';
import OrganizationPageContainer from '../../../../../containers/organization/OrganizationPageContainer';
import OrganizationPageLayout from '../layout/OrganizationPageLayout';
import OrganizationPageView from '../views/OrganizationPageView';
import { EntityPageSection } from '../../../../shared/layout/EntityPageSection';
import { useUpdateNavigation } from '../../../../../hooks';
import { PageProps } from '../../../../shared/types/PageProps';

interface OrganizationPageProps extends PageProps {}

export const OrganizationPage: FC<OrganizationPageProps> = ({ paths }) => {
  useUpdateNavigation({ currentPaths: paths });

  return (
    <OrganizationPageLayout currentSection={EntityPageSection.Profile}>
      <OrganizationPageContainer>
        {(entities, state) => {
          return <OrganizationPageView entities={entities} state={state} />;
        }}
      </OrganizationPageContainer>
    </OrganizationPageLayout>
  );
};
export default OrganizationPage;
