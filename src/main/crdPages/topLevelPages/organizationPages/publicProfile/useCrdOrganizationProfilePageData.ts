import { useOrganizationAccountQuery } from '@/core/apollo/generated/apollo-hooks';
import useAccountResources from '@/domain/community/contributor/useAccountResources/useAccountResources';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import useOrganizationProvider from '@/domain/community/organization/useOrganization/useOrganization';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';

/**
 * Container hook for the Organization public-profile page — bundles every
 * Apollo / domain hook the page relies on into a single typed view-model so
 * the page component stays purely declarative (CLAUDE.md: "Keep Apollo-related
 * hooks in Containers/hooks, not directly in Pages").
 *
 * Returns the resolved organization context + provider data, the org's account
 * resources, and per-region loading flags. The page reads from the returned
 * view model and never touches Apollo or the domain hooks directly.
 */
export const useCrdOrganizationProfilePageData = () => {
  const { organization, loading: contextLoading } = useOrganizationContext();
  const provided = useOrganizationProvider();
  const { isAuthenticated } = useCurrentUserContext();

  const { data: organizationAccountData, loading: loadingAccount } = useOrganizationAccountQuery({
    variables: { organizationId: organization?.id ?? '' },
    skip: !organization?.id,
  });
  const accountResources = useAccountResources(organizationAccountData?.lookup.organization?.account?.id) ?? undefined;

  return {
    organization,
    provided,
    isAuthenticated,
    accountResources,
    loading: {
      context: contextLoading,
      provider: provided.loading,
      account: loadingAccount,
    },
  };
};
