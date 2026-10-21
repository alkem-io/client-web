import { useUserHostedResourcesQuery } from '@/core/apollo/generated/apollo-hooks';
import useUserContributions from '@/domain/community/user/userContributions/useUserContributions';
import useUserOrganizationIds from '@/domain/community/user/userContributions/useUserOrganizationIds';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useCanEditSettings from '../useCanEditSettings';
import useUserPageRouteContext from '../useUserPageRouteContext';

export const useCrdUserProfilePageData = () => {
  const route = useUserPageRouteContext();
  const { userId, loading: routeLoading } = route;
  const { isAuthenticated } = useCurrentUserContext();

  const { canEditSettings } = useCanEditSettings({ profileUserId: userId });

  // The server returns only the hosted resources this viewer may see; guests
  // get nothing, so the query is not sent for them at all.
  const { data: hostedData, loading: loadingHosted } = useUserHostedResourcesQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { userId: userId! },
    skip: !userId || !isAuthenticated,
  });
  const accountResources = hostedData?.lookup.user?.hostedResources ?? undefined;

  const contributions = useUserContributions(userId);
  const organizationIds = useUserOrganizationIds(userId);

  return {
    ...route,
    canEditSettings,
    accountResources,
    contributions,
    organizationIds,
    // Folding `routeLoading` into the downstream flags prevents the page from
    // briefly painting empty-state for the wrong user between route resolution
    // and the dependent queries firing.
    loading: {
      route: routeLoading,
      userAccount: routeLoading || loadingHosted,
      organizations: routeLoading || (userId !== undefined && organizationIds === undefined),
      memberships: routeLoading || (userId !== undefined && contributions === undefined),
    },
  };
};
