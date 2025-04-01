import OrganizationPageLayout from '../layout/OrganizationPageLayout';
import OrganizationPageView from '../views/OrganizationPageView';
import Loading from '@/core/ui/loading/Loading';
import { useOrganizationAccountQuery } from '@/core/apollo/generated/apollo-hooks';
import useAccountResources from '@/domain/community/contributor/useAccountResources/useAccountResources';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useOrganizationProvider from '../../contributor/organization/useOrganization/useOrganization';

export const OrganizationPage = () => {
  const { organizationId, loading: resolvingOrganization } = useUrlResolver();

  const { data: organizationData, loading: loadingOrganization } = useOrganizationAccountQuery({
    variables: {
      organizationId: organizationId!,
    },
    skip: !organizationId,
  });

  const organizationProvided = useOrganizationProvider();
  const accountResources = useAccountResources(organizationData?.lookup.organization?.account?.id);
  const loading = resolvingOrganization || loadingOrganization || organizationProvided.loading;

  if (!organizationData || loading) return <Loading />;

  return (
    <OrganizationPageLayout>
      <OrganizationPageView
        organizationProvided={organizationProvided}
        loading={loading}
        accountResources={accountResources}
      />
    </OrganizationPageLayout>
  );
};

export default OrganizationPage;
