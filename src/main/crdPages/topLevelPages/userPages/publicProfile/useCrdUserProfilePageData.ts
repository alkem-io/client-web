import { useUserHostedResourcesQuery } from '@/core/apollo/generated/apollo-hooks';
import useUserContributions from '@/domain/community/user/userContributions/useUserContributions';
import useUserOrganizationIds from '@/domain/community/user/userContributions/useUserOrganizationIds';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useCanEditSettings from '../useCanEditSettings';
import useUserPageRouteContext from '../useUserPageRouteContext';

export const useCrdUserProfilePageData = () => {
  const route = useUserPageRouteContext();
  const { userId, loading: routeLoading } = route;
  const { isAuthenticated, loadingMe } = useCurrentUserContext();

  const { canEditSettings } = useCanEditSettings({ profileUserId: userId });

  // The server returns only the hosted resources this viewer may see; guests
  // get nothing, so the query is not sent for them at all. A failed read only
  // hides the Other Resources tab, so it opts out of the global error toast.
  const { data: hostedData, loading: loadingHosted } = useUserHostedResourcesQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { userId: userId! },
    skip: !userId || !isAuthenticated,
    context: { skipGlobalErrorHandler: true },
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
    // and the dependent queries firing. `loadingMe` is folded into the hosted
    // flag because the query stays skipped until auth resolves, so the tab
    // strip would otherwise settle without Other Resources and then change.
    loading: {
      route: routeLoading,
      userAccount: routeLoading || loadingMe || loadingHosted,
      organizations: routeLoading || (userId !== undefined && organizationIds === undefined),
      memberships: routeLoading || (userId !== undefined && contributions === undefined),
    },
  };
};
