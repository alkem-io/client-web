import OrganizationPageContainer from '../OrganizationPageContainer/OrganizationPageContainer';
import OrganizationPageLayout from '../layout/OrganizationPageLayout';
import OrganizationPageView from '../views/OrganizationPageView';
import Loading from '@/core/ui/loading/Loading';
import TopLevelLayout from '@/main/ui/layout/TopLevelLayout';
import { Error404 } from '@/core/pages/Errors/Error404';
import { useOrganization } from '../hooks/useOrganization';
import { useOrganizationAccountQuery } from '@/core/apollo/generated/apollo-hooks';
import useAccountResources from '@/domain/community/contributor/useAccountResources/useAccountResources';

export const OrganizationPage = () => {
  const { organization, loading } = useOrganization();

  const { data: organizationData, loading: loadingOrganization } = useOrganizationAccountQuery({
    variables: {
      organizationNameId: organization?.nameID!,
    },
    skip: !organization?.nameID,
  });

  const accountResources = useAccountResources(organizationData?.organization.account?.id);

  if (loading) return <Loading />;

  if (!organization && !loading && !loadingOrganization) {
    return (
      <TopLevelLayout>
        <Error404 />
      </TopLevelLayout>
    );
  }

  return (
    <OrganizationPageLayout>
      <OrganizationPageContainer>
        {(entities, state) => (
          <OrganizationPageView entities={entities} state={state} accountResources={accountResources} />
        )}
      </OrganizationPageContainer>
    </OrganizationPageLayout>
  );
};

export default OrganizationPage;
