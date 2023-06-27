import React, { FC } from 'react';
import OrganizationPageContainer from '../OrganizationPageContainer/OrganizationPageContainer';
import OrganizationPageLayout from '../layout/OrganizationPageLayout';
import OrganizationPageView from '../views/OrganizationPageView';
import { EntityPageSection } from '../../../../shared/layout/EntityPageSection';

interface OrganizationPageProps {}

export const OrganizationPage: FC<OrganizationPageProps> = () => {
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
