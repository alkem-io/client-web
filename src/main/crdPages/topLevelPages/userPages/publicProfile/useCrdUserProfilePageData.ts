import { useUserAccountQuery } from '@/core/apollo/generated/apollo-hooks';
import useAccountResources from '@/domain/community/contributor/useAccountResources/useAccountResources';
import useUserContributions from '@/domain/community/user/userContributions/useUserContributions';
import useUserOrganizationIds from '@/domain/community/user/userContributions/useUserOrganizationIds';
import useCanEditSettings from '../useCanEditSettings';
import useUserPageRouteContext from '../useUserPageRouteContext';

export const useCrdUserProfilePageData = () => {
  const route = useUserPageRouteContext();
  const { userId, loading: routeLoading } = route;

  const { canEditSettings } = useCanEditSettings({ profileUserId: userId });

  const { data: userAccountData, loading: loadingUserAccount } = useUserAccountQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { userId: userId! },
    skip: !userId,
  });
  const accountResources = useAccountResources(userAccountData?.lookup.user?.account?.id) ?? undefined;

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
      userAccount: routeLoading || loadingUserAccount,
      organizations: routeLoading || (userId !== undefined && organizationIds === undefined),
      memberships: routeLoading || (userId !== undefined && contributions === undefined),
    },
  };
};

export type CrdUserProfilePageData = ReturnType<typeof useCrdUserProfilePageData>;
