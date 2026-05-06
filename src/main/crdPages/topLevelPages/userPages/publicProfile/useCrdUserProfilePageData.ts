import { useUserAccountQuery } from '@/core/apollo/generated/apollo-hooks';
import useAccountResources from '@/domain/community/contributor/useAccountResources/useAccountResources';
import useUserContributions from '@/domain/community/user/userContributions/useUserContributions';
import useUserOrganizationIds from '@/domain/community/user/userContributions/useUserOrganizationIds';
import useCanEditSettings from '../useCanEditSettings';
import useUserPageRouteContext from '../useUserPageRouteContext';

/**
 * Container hook for the User public-profile page — bundles every Apollo /
 * domain hook the page relies on into a single typed view-model so the page
 * component stays purely declarative (CLAUDE.md: "Keep Apollo-related hooks in
 * Containers/hooks, not directly in Pages").
 *
 * Returns the resolved-from-URL viewer + viewed-user identity, the user's
 * account resources, contributions (memberships) and associated organisation
 * ids, plus per-region loading flags. The page reads from the returned view
 * model and never touches Apollo or the domain hooks directly.
 */
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
    loading: {
      route: routeLoading,
      userAccount: loadingUserAccount,
      organizations: userId !== undefined && organizationIds === undefined,
      memberships: userId !== undefined && contributions === undefined,
    },
  };
};

export type CrdUserProfilePageData = ReturnType<typeof useCrdUserProfilePageData>;
