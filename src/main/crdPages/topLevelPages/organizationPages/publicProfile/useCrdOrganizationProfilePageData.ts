import { useOrganizationHostedResourcesQuery } from '@/core/apollo/generated/apollo-hooks';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import useOrganizationProvider from '@/domain/community/organization/useOrganization/useOrganization';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';

/**
 * Container hook for the Organization public-profile page — bundles every
 * Apollo / domain hook the page relies on into a single typed view-model so
 * the page component stays purely declarative (CLAUDE.md: "Keep Apollo-related
 * hooks in Containers/hooks, not directly in Pages").
 *
 * Returns the resolved organization context + provider data, the org's hosted
 * resources as the server scoped them for the current viewer (not fetched for
 * guests), the viewer's auth state (`isAuthenticated`, `loadingMe`), and
 * per-region loading flags. The page reads from the returned view model and
 * never touches Apollo or the domain hooks directly.
 */
export const useCrdOrganizationProfilePageData = () => {
  const { organization, loading: contextLoading } = useOrganizationContext();
  const provided = useOrganizationProvider();
  const { isAuthenticated, loadingMe } = useCurrentUserContext();

  // A failed read only hides the Other Resources tab, so it opts out of the
  // global error toast.
  const { data, loading: loadingHosted } = useOrganizationHostedResourcesQuery({
    variables: { organizationId: organization?.id ?? '' },
    skip: !organization?.id || !isAuthenticated,
    context: { skipGlobalErrorHandler: true },
  });
  const accountResources = data?.lookup.organization?.hostedResources ?? undefined;

  return {
    organization,
    provided,
    isAuthenticated,
    loadingMe,
    accountResources,
    loading: {
      context: contextLoading,
      provider: provided.loading,
      // The query stays skipped until auth resolves, so `loadingMe` keeps the
      // tab strip from settling without Other Resources and then changing.
      account: loadingMe || loadingHosted,
    },
  };
};
