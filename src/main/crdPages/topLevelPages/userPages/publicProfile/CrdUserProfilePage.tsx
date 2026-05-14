import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Error404 } from '@/core/pages/Errors/Error404';
import { usePageTitle } from '@/core/routing/usePageTitle';
import type { BreadcrumbTrailItem } from '@/crd/components/common/BreadcrumbsTrail';
import type { ResourceTabKey } from '@/crd/components/common/ProfileResourceTabStrip';
import { UserPublicProfileView } from '@/crd/components/user/UserPublicProfileView';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { RoleType } from '@/domain/community/user/constants/RoleType';
import useFilteredMemberships from '@/domain/community/user/hooks/useFilteredMemberships';
import { MembershipCardConnector } from '@/main/crdPages/topLevelPages/common/MembershipCardConnector';
import { normaliseReferences } from '@/main/crdPages/topLevelPages/common/profileMapperHelpers';
import useResourceTabs from '@/main/crdPages/topLevelPages/common/useResourceTabs';
import { useSendMessageToUserHandler } from '@/main/crdPages/topLevelPages/common/useSendMessageHandler';
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import { AssociatedOrganizationCardConnector } from './AssociatedOrganizationCardConnector';
import { buildUserProfileTagsets, mapHostedSpacesToCardData } from './publicProfileMapper';
import { useCrdUserProfilePageData } from './useCrdUserProfilePageData';

export const CrdUserProfilePage = () => {
  const { t } = useTranslation('crd-profilePages');
  const data = useCrdUserProfilePageData();
  const { userId, userModel, currentUserId, accountResources, contributions, organizationIds, loading } = data;
  usePageTitle(userModel?.profile?.displayName);

  const { activeTab, onSelectTab } = useResourceTabs();

  const { onSendMessage } = useSendMessageToUserHandler({ recipientUserId: userId });

  const tabs = [
    { key: 'resourcesHosted' as ResourceTabKey, label: t('userProfile.tabs.resourcesHosted') },
    { key: 'leading' as ResourceTabKey, label: t('userProfile.tabs.leading') },
    { key: 'memberOf' as ResourceTabKey, label: t('userProfile.tabs.memberOf') },
  ];

  const heroLoading = loading.route || !userModel;
  const orgsLoading = loading.organizations;
  const hostedLoading = loading.userAccount;
  const membershipsLoading = loading.memberships;

  const safeContributions = contributions ?? [];
  const [leadingItems, memberItems] = useFilteredMemberships(safeContributions, [RoleType.Lead, RoleType.Admin]);

  const breadcrumbDisplayName = userModel?.profile?.displayName ?? '';
  const breadcrumbItems: BreadcrumbTrailItem[] = breadcrumbDisplayName
    ? [{ label: breadcrumbDisplayName, icon: User }]
    : [];
  useSetBreadcrumbs(breadcrumbItems);

  if (!loading.route && !userModel) {
    return <Error404 />;
  }

  const profile = userModel?.profile;
  const id = userModel?.id ?? userId ?? '';
  const color = pickColorFromId(id);

  const city = profile?.location?.city?.trim() ?? '';
  const country = profile?.location?.country?.trim() ?? '';
  const location =
    city && country
      ? t('common.locationFormat', { city, country })
      : city
        ? t('common.locationCityOnly', { city })
        : country
          ? t('common.locationCountryOnly', { country })
          : null;

  const isOwnProfile = Boolean(currentUserId && userModel?.id && currentUserId === userModel.id);

  const showSettingsIcon = data.canEditSettings;
  const showMessageButton = Boolean(currentUserId) && !isOwnProfile;

  const settingsHref = profile?.url ? `${profile.url}/settings/profile` : undefined;

  const { hostedSpaces, hostedVirtualContributors, hostedInnovationPacks, hostedInnovationHubs } =
    mapHostedSpacesToCardData(accountResources, t('userProfile.vcType'));

  const spacesLeading = leadingItems.map(item => <MembershipCardConnector key={item.id} contribution={item} />);
  const spacesMember = memberItems.map(item => <MembershipCardConnector key={item.id} contribution={item} />);

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
        references: normaliseReferences(profile?.references ?? []),
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
