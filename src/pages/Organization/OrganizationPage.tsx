import React, { FC } from 'react';
import OrganizationPageContainer from '../../containers/organization/OrganizationPageContainer';
import { useUpdateNavigation } from '../../hooks';
import OrganizationPageView from '../../views/Organization/OrganizationPageView';
import { PageProps } from '../common';

interface OrganizationPageProps extends PageProps {}

export const OrganizationPage: FC<OrganizationPageProps> = ({ paths }) => {
  useUpdateNavigation({ currentPaths: paths });

  return (
    <OrganizationPageContainer>
      {(entities, state) => {
        return <OrganizationPageView entities={entities} state={state} />;
      }}
    </OrganizationPageContainer>
  );
};
export default OrganizationPage;
