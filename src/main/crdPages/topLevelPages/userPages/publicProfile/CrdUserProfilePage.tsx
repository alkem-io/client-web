import { useTranslation } from 'react-i18next';
import { Error404 } from '@/core/pages/Errors/Error404';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { UserPublicProfileView } from '@/crd/components/user/UserPublicProfileView';
import type { ResourceTabKey } from '@/crd/components/user/UserResourceTabStrip';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { RoleType } from '@/domain/community/user/constants/RoleType';
import useFilteredMemberships from '@/domain/community/user/hooks/useFilteredMemberships';
import { useSendMessageToUserHandler } from '../../common/useSendMessageHandler';
import { normaliseReferences } from '../../organizationPages/publicProfile/organizationProfileMapper';
import { AssociatedOrganizationCardConnector } from './AssociatedOrganizationCardConnector';
import { MembershipCardConnector } from './MembershipCardConnector';
import { buildLocationLine, buildUserProfileTagsets, mapHostedSpacesToCardData } from './publicProfileMapper';
import { useCrdUserProfilePageData } from './useCrdUserProfilePageData';
import useResourceTabs from './useResourceTabs';

const buildSettingsHrefForUserSlug = (slug: string | undefined) =>
  slug ? `/user/${slug}/settings/profile` : undefined;

export const CrdUserProfilePage = () => {
  const { t } = useTranslation('crd-profilePages');
  const data = useCrdUserProfilePageData();
  const { userId, userModel, userSlug, currentUserId, accountResources, contributions, organizationIds, loading } =
    data;
  usePageTitle(userModel?.profile?.displayName);

  const { activeTab, onSelectTab } = useResourceTabs();

  const { onSendMessage } = useSendMessageToUserHandler({ recipientUserId: userId });

  const tabs = [
    { key: 'resourcesHosted' as ResourceTabKey, label: t('userProfile.tabs.resourcesHosted') },
    { key: 'leading' as ResourceTabKey, label: t('userProfile.tabs.leading') },
    { key: 'memberOf' as ResourceTabKey, label: t('userProfile.tabs.memberOf') },
  ];

  // Loading flags per region (FR-009).
  const heroLoading = loading.route || !userModel;
  const orgsLoading = loading.organizations;
  const hostedLoading = loading.userAccount;
  const membershipsLoading = loading.memberships;

  // Hooks below MUST run on every render (rules of hooks). Build all derived
  // data before any early return.
  const safeContributions = contributions ?? [];
  const [leadingItems, memberItems] = useFilteredMemberships(safeContributions, [RoleType.Lead, RoleType.Admin]);

  // 404 — `userId` resolved (no longer loading) but no userModel returned.
  if (!loading.route && userId === undefined) {
    return <Error404 />;
  }

  const profile = userModel?.profile;
  const id = userModel?.id ?? userId ?? '';
  const color = pickColorFromId(id);

  const location = buildLocationLine(
    profile?.location?.city,
    profile?.location?.country,
    vars => t('common.locationFormat', vars),
    vars => t('common.locationCityOnly', vars),
    vars => t('common.locationCountryOnly', vars)
  );

  const isOwnProfile = Boolean(currentUserId && userModel?.id && currentUserId === userModel.id);

  const showSettingsIcon = data.canEditSettings;
  const showMessageButton = Boolean(currentUserId) && !isOwnProfile;

  const settingsHref = buildSettingsHrefForUserSlug(userSlug);

  // Hosted resources — 4 sub-sections per FR-013 (refined).
  const { hostedSpaces, hostedVirtualContributors, hostedInnovationPacks, hostedInnovationHubs } =
    mapHostedSpacesToCardData(accountResources, t('userProfile.vcType'));

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
          bioEmpty: t('userProfile.sidebar.bioEmpty'),
          organizationsEmpty: t('userProfile.sidebar.organizationsEmpty'),
        },
      }}
      tabStrip={{
        tabs,
        activeTab,
        onSelectTab,
        ariaLabel: t('common.resourceTabsAriaLabel'),
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
          spacePrivacy: {
            privacyPrivate: t('common.spacePrivacy.private'),
            privacyPublic: t('common.spacePrivacy.public'),
          },
        },
      }}
      loading={{
        hero: heroLoading,
        organizations: orgsLoading,
        hostedResources: hostedLoading,
        memberships: membershipsLoading,
      }}
      loadingLabels={{
        hero: t('common.loading.hero'),
        organizations: t('common.loading.organizations'),
        hostedResources: t('common.loading.hostedResources'),
        memberships: t('common.loading.memberships'),
      }}
    />
  );
};

export default CrdUserProfilePage;
