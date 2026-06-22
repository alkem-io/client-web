import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/core/routing/usePageTitle';
import type { BreadcrumbTrailItem } from '@/crd/components/common/BreadcrumbsTrail';
import type { ResourceTabKey } from '@/crd/components/common/ProfileResourceTabStrip';
import { UserPublicProfileView } from '@/crd/components/user/UserPublicProfileView';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { RoleType } from '@/domain/community/user/constants/RoleType';
import useFilteredMemberships from '@/domain/community/user/hooks/useFilteredMemberships';
import { CrdNotFoundView } from '@/main/crdPages/error/CrdNotFoundView';
import { MembershipCardConnector } from '@/main/crdPages/topLevelPages/common/MembershipCardConnector';
import { normaliseReferences } from '@/main/crdPages/topLevelPages/common/profileMapperHelpers';
import useResourceTabs from '@/main/crdPages/topLevelPages/common/useResourceTabs';
import {
  useSendEmailToUserHandler,
  useSendMessageToUserHandler,
} from '@/main/crdPages/topLevelPages/common/useSendMessageHandler';
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import { AssociatedOrganizationCardConnector } from './AssociatedOrganizationCardConnector';
import { buildUserProfileTagsets, mapHostedSpacesToCardData } from './publicProfileMapper';
import { useCrdUserProfilePageData } from './useCrdUserProfilePageData';

export const CrdUserProfilePage = () => {
  const { t } = useTranslation('crd-profilePages');
  const data = useCrdUserProfilePageData();
  const {
    userId,
    userModel,
    currentUserId,
    isContactable,
    isContactableViaEmail,
    accountResources,
    contributions,
    organizationIds,
    loading,
  } = data;
  usePageTitle(userModel?.profile?.displayName);

  const { activeTab, onSelectTab } = useResourceTabs();

  const { onSendMessage: onSendChatMessage } = useSendMessageToUserHandler({ recipientUserId: userId });
  const { onSendMessage: onSendEmailMessage } = useSendEmailToUserHandler({ recipientUserId: userId });

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
    return <CrdNotFoundView />;
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

  // FR-011: chat is the default route; offer the email fallback only when the
  // recipient has chat off AND has opted in to email contact. Neither → the
  // user cannot be reached and we explain rather than offer a route.
  const viewerCanContact = Boolean(currentUserId) && !isOwnProfile;
  const emailFallbackOnly = !isContactable && isContactableViaEmail;
  const showMessageButton = viewerCanContact && (isContactable || emailFallbackOnly);
  const showCannotBeReached = viewerCanContact && !isContactable && !isContactableViaEmail;

  const onSendMessage = emailFallbackOnly ? onSendEmailMessage : onSendChatMessage;

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
        messageTitle: emailFallbackOnly ? t('common.messagePopover.emailTitle') : undefined,
        messageNotice: emailFallbackOnly ? t('common.messagePopover.emailNotice') : undefined,
        messagePlaceholder: emailFallbackOnly ? t('common.messagePopover.emailPlaceholder') : undefined,
        cannotBeReachedLabel: showCannotBeReached ? t('common.messagePopover.cannotBeReached') : undefined,
      }}
      sidebar={{
        bio: profile?.description ?? null,
        tagsets: buildUserProfileTagsets(profile?.tagsets, {
          keywords: t('components.profile.fields.keywords.title', { ns: 'crd-common' }),
          skills: t('components.profile.fields.skills.title', { ns: 'crd-common' }),
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
          templatePacksSubsection: t('common.innovation-packs', { ns: 'crd-common' }),
          customHomepagesSubsection: t('common.customHomepages', { ns: 'crd-common' }),
          spacesLeading: t('userProfile.sections.spacesLeading'),
          memberOf: t('userProfile.sections.memberOf'),
          emptyResourcesHosted: t('userProfile.empty.resourcesHosted'),
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
