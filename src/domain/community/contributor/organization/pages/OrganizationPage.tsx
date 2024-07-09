import React, { FC } from 'react';
import OrganizationPageContainer from '../OrganizationPageContainer/OrganizationPageContainer';
import OrganizationPageLayout from '../layout/OrganizationPageLayout';
import OrganizationPageView from '../views/OrganizationPageView';
import Loading from '../../../../../core/ui/loading/Loading';
import TopLevelLayout from '../../../../../main/ui/layout/TopLevelLayout';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import { useOrganization } from '../hooks/useOrganization';

interface OrganizationPageProps {}

export const OrganizationPage: FC<OrganizationPageProps> = () => {
  const { organization, loading } = useOrganization();

  if (loading) return <Loading />;

  if (!organization && !loading) {
    return (
      <TopLevelLayout>
        <Error404 />
      </TopLevelLayout>
    );
  }

  return (
    <OrganizationPageLayout>
      <OrganizationPageContainer>
        {(entities, state) => <OrganizationPageView entities={entities} state={state} />}
      </OrganizationPageContainer>
    </OrganizationPageLayout>
  );
};

export default OrganizationPage;
