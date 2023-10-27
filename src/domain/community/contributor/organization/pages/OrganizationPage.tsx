import React, { FC } from 'react';
import OrganizationPageContainer from '../OrganizationPageContainer/OrganizationPageContainer';
import OrganizationPageLayout from '../layout/OrganizationPageLayout';
import OrganizationPageView from '../views/OrganizationPageView';

interface OrganizationPageProps {}

export const OrganizationPage: FC<OrganizationPageProps> = () => {
  return (
    <OrganizationPageLayout>
      <OrganizationPageContainer>
        {(entities, state) => {
          return <OrganizationPageView entities={entities} state={state} />;
        }}
      </OrganizationPageContainer>
    </OrganizationPageLayout>
  );
};

export default OrganizationPage;
