import React, { FC } from 'react';
import OrganizationPageContainer from '../../containers/organization/OrganizationPageContainer';
import { ThemeProviderV2 } from '../../context/ThemeProvider';
import { useUpdateNavigation } from '../../hooks';
import OrganizationPageView from '../../views/Organization/OrganizationPageView';
import { PageProps } from '../common';

interface OrganizationPageProps extends PageProps {}

export const OrganizationPage: FC<OrganizationPageProps> = ({ paths }) => {
  useUpdateNavigation({ currentPaths: paths });

  return (
    <ThemeProviderV2>
      <OrganizationPageContainer>
        {(entities, state) => {
          return <OrganizationPageView entities={entities} state={state} />;
        }}
      </OrganizationPageContainer>
    </ThemeProviderV2>
  );
};
export default OrganizationPage;
