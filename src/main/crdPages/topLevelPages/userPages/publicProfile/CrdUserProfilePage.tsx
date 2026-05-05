import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserAccountQuery } from '@/core/apollo/generated/apollo-hooks';
import { Error404 } from '@/core/pages/Errors/Error404';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { UserPublicProfileView } from '@/crd/components/user/UserPublicProfileView';
import type { ResourceTabKey } from '@/crd/components/user/UserResourceTabStrip';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import useAccountResources from '@/domain/community/contributor/useAccountResources/useAccountResources';
import { RoleType } from '@/domain/community/user/constants/RoleType';
import useFilteredMemberships from '@/domain/community/user/hooks/useFilteredMemberships';
import useUserContributions from '@/domain/community/user/userContributions/useUserContributions';
import useUserOrganizationIds from '@/domain/community/user/userContributions/useUserOrganizationIds';
import { useSendMessageToUserHandler } from '../../common/useSendMessageHandler';
import useCanEditSettings from '../useCanEditSettings';
import useUserPageRouteContext from '../useUserPageRouteContext';
import { AssociatedOrganizationCardConnector } from './AssociatedOrganizationCardConnector';
import { MembershipCardConnector } from './MembershipCardConnector';
import { buildLocationLine, mapHostedSpacesToCardData } from './publicProfileMapper';
import useResourceTabs from './useResourceTabs';

const buildSettingsHrefForUserSlug = (slug: string | undefined) =>
  slug ? `/user/${slug}/settings/profile` : undefined;

export const CrdUserProfilePage = () => {
  const { t } = useTranslation('crd-profilePages');
  const { userId, userModel, userSlug, currentUserId, loading: routeLoading } = useUserPageRouteContext();
  usePageTitle(userModel?.profile?.displayName);

  const { canEditSettings } = useCanEditSettings({ profileUserId: userId });

  const { data: userAccountData, loading: loadingUserAccount } = useUserAccountQuery({
    variables: { userId: userId! },
    skip: !userId,
  });
  const accountResources = useAccountResources(userAccountData?.lookup.user?.account?.id);

  const contributions = useUserContributions(userId);
  const organizationIds = useUserOrganizationIds(userId);

  const { activeTab, onSelectTab } = useResourceTabs();

  const { onSendMessage } = useSendMessageToUserHandler({ recipientUserId: userId });

  // Tab definitions (i18n).
  const tabs = useMemo(
    () => [
      { key: 'allResources' as ResourceTabKey, label: t('userProfile.tabs.allResources') },
      { key: 'hostedSpaces' as ResourceTabKey, label: t('userProfile.tabs.hostedSpaces') },
      { key: 'virtualContributors' as ResourceTabKey, label: t('userProfile.tabs.virtualContributors') },
      { key: 'leading' as ResourceTabKey, label: t('userProfile.tabs.leading') },
      { key: 'memberOf' as ResourceTabKey, label: t('userProfile.tabs.memberOf') },
    ],
    [t]
  );

  // Loading flags per region (FR-009).
  const heroLoading = routeLoading || !userModel;
  const orgsLoading = userId !== undefined && organizationIds === undefined;
  const hostedLoading = loadingUserAccount;
  const membershipsLoading = userId !== undefined && contributions === undefined;

  // Hooks below MUST run on every render (rules of hooks). Build all derived
  // data before any early return.
  const safeContributions = contributions ?? [];
  const [leadingItems, memberItems] = useFilteredMemberships(safeContributions, [RoleType.Lead, RoleType.Admin]);

  // 404 — `userId` resolved (no longer loading) but no userModel returned.
  if (!routeLoading && userId === undefined) {
    return <Error404 />;
  }

  const profile = userModel?.profile;
  const id = userModel?.id ?? userId ?? '';
  const color = id ? pickColorFromId(id) : '#42a5f5';

  const location = buildLocationLine(
    profile?.location?.city,
    profile?.location?.country,
    vars => t('common.locationFormat', vars),
    vars => t('common.locationCityOnly', vars),
    vars => t('common.locationCountryOnly', vars)
  );

  const isOwnProfile = Boolean(currentUserId && userModel?.id && currentUserId === userModel.id);

  const showSettingsIcon = canEditSettings;
  const showMessageButton = Boolean(currentUserId) && !isOwnProfile;

  const settingsHref = buildSettingsHrefForUserSlug(userSlug);

  // Hosted resources (per-prototype: spaces + VCs only).
  const { hostedSpaces, hostedVirtualContributors } = mapHostedSpacesToCardData(
    accountResources ?? undefined,
    t('userProfile.vcType')
  );

  const spacesLeading = leadingItems.map(item => <MembershipCardConnector key={item.id} contribution={item} />);
  const spacesMember = memberItems.map(item => <MembershipCardConnector key={item.id} contribution={item} />);

  // Organizations sidebar.
  const safeOrgIds = organizationIds ?? [];
  const organizationsSlot = safeOrgIds.map(orgId => (
    <AssociatedOrganizationCardConnector key={orgId} organizationId={orgId} />
  ));

  return (
    <UserPublicProfileView
      hero={{
        bannerImageUrl: null,
        avatarImageUrl: profile?.avatar?.uri ?? null,
        color,
        displayName: profile?.displayName ?? '',
        location,
        showSettingsIcon,
        settingsHref,
        showMessageButton,
        onSendMessage: showMessageButton ? onSendMessage : undefined,
      }}
      sidebar={{
        bio: profile?.description ?? null,
        organizationsSlot,
        organizationsEmpty: safeOrgIds.length === 0,
        labels: {
          aboutTitle: t('userProfile.sidebar.aboutTitle'),
          organizationsTitle: t('userProfile.sidebar.organizationsTitle'),
          emptyBio: t('userProfile.sidebar.emptyBio'),
          emptyOrganizations: t('userProfile.sidebar.emptyOrganizations'),
        },
      }}
      tabStrip={{
        tabs,
        activeTab,
        onSelectTab,
      }}
      sections={{
        activeTab,
        hostedSpaces,
        hostedVirtualContributors,
        spacesLeading,
        spacesMember,
        labels: {
          resourcesHosted: t('userProfile.sections.resourcesHosted'),
          spacesSubsection: t('userProfile.sections.spacesSubsection'),
          virtualContributorsSubsection: t('userProfile.sections.virtualContributorsSubsection'),
          spacesLeading: t('userProfile.sections.spacesLeading'),
          memberOf: t('userProfile.sections.memberOf'),
          totalBadge: count => t('userProfile.sections.totalBadge', { count }),
          emptyLeading: t('userProfile.empty.leading'),
          emptyMembership: t('userProfile.empty.membership'),
        },
      }}
      loading={{
        hero: heroLoading,
        organizations: orgsLoading,
        hostedResources: hostedLoading,
        memberships: membershipsLoading,
      }}
    />
  );
};

export default CrdUserProfilePage;
