import OrganizationPageContainer from '../../contributor/organization/OrganizationPageContainer/OrganizationPageContainer';
import OrganizationPageLayout from '../layout/OrganizationPageLayout';
import OrganizationPageView from '../views/OrganizationPageView';
import Loading from '@/core/ui/loading/Loading';
import { useOrganizationAccountQuery } from '@/core/apollo/generated/apollo-hooks';
import useAccountResources from '@/domain/community/contributor/useAccountResources/useAccountResources';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

export const OrganizationPage = () => {
  const { organizationId, loading: resolvingOrganization } = useUrlResolver();

  const { data: organizationData, loading: loadingOrganization } = useOrganizationAccountQuery({
    variables: {
      organizationId: organizationId!,
    },
    skip: !organizationId,
  });

  const accountResources = useAccountResources(organizationData?.lookup.organization?.account?.id);
  const loading = resolvingOrganization || loadingOrganization;

  if (!organizationData || loading) return <Loading />;

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
