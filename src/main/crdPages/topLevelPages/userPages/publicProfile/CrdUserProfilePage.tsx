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
import { normaliseReferences } from '../../organizationPages/publicProfile/organizationProfileMapper';
import useCanEditSettings from '../useCanEditSettings';
import useUserPageRouteContext from '../useUserPageRouteContext';
import { AssociatedOrganizationCardConnector } from './AssociatedOrganizationCardConnector';
import { MembershipCardConnector } from './MembershipCardConnector';
import { buildLocationLine, buildUserProfileTagsets, mapHostedSpacesToCardData } from './publicProfileMapper';
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

  // Tab definitions (i18n) — 3 tabs per FR-013 (refined).
  const tabs = useMemo(
    () => [
      { key: 'resourcesHosted' as ResourceTabKey, label: t('userProfile.tabs.resourcesHosted') },
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

  // Hosted resources — 4 sub-sections per FR-013 (refined).
  const { hostedSpaces, hostedVirtualContributors, hostedInnovationPacks, hostedInnovationHubs } =
    mapHostedSpacesToCardData(accountResources ?? undefined, t('userProfile.vcType'));

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
        tagsets: buildUserProfileTagsets(profile?.tagsets, {
          keywords: t('components.profile.fields.keywords.title', { ns: 'translation' }),
          skills: t('components.profile.fields.skills.title', { ns: 'translation' }),
        }),
        organizationsSlot,
        organizationsEmpty: safeOrgIds.length === 0,
        references: normaliseReferences(
          (profile?.references ?? []).map(r => ({
            id: r.id,
            name: r.name,
            uri: r.uri,
            description: r.description ?? null,
          }))
        ),
        labels: {
          aboutTitle: t('userProfile.sidebar.aboutTitle'),
          organizationsTitle: t('userProfile.sidebar.organizationsTitle'),
          socialLinksTitle: t('userProfile.sidebar.socialLinksTitle'),
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
        hostedInnovationPacks,
        hostedInnovationHubs,
        spacesLeading,
        spacesMember,
        labels: {
          spacesSubsection: t('userProfile.sections.spacesSubsection'),
          virtualContributorsSubsection: t('userProfile.sections.virtualContributorsSubsection'),
          // FR-102 parity reuse: pulled from the global `translation` namespace
          // (existing keys), not duplicated under `crd-profilePages`.
          templatePacksSubsection: t('common.innovation-packs', { ns: 'translation' }),
          customHomepagesSubsection: t('common.customHomepages', { ns: 'translation' }),
          spacesLeading: t('userProfile.sections.spacesLeading'),
          memberOf: t('userProfile.sections.memberOf'),
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
