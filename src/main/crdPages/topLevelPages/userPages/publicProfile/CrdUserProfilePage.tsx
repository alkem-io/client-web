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
  useOpenDirectChatHandler,
  // Email-to-user contact route temporarily disabled client-side (chat-only):
  // handler intentionally not imported. See the deactivation notes below.
  // useSendEmailToUserHandler,
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
    // Email-to-user contact route temporarily disabled client-side (chat-only).
    // isContactableViaEmail,
    accountResources,
    contributions,
    organizationIds,
    loading,
  } = data;
  usePageTitle(userModel?.profile?.displayName);

  const { activeTab, onSelectTab } = useResourceTabs('memberOf');

  const { onOpenChat } = useOpenDirectChatHandler({ recipientUserId: userId });
  // Email-to-user contact route temporarily DISABLED client-side — chat only.
  // To re-enable: restore the `useSendEmailToUserHandler` import, this handler,
  // the `isContactableViaEmail` destructure, `showEmail`, and the `onSendEmail`
  // wiring below. The server transport/setting are unchanged.
  // const { onSendMessage: onSendEmailMessage } = useSendEmailToUserHandler({ recipientUserId: userId });

  const tabs = [
    { key: 'memberOf' as ResourceTabKey, label: t('userProfile.tabs.memberOf') },
    { key: 'leading' as ResourceTabKey, label: t('userProfile.tabs.leading') },
    { key: 'resourcesHosted' as ResourceTabKey, label: t('userProfile.tabs.resourcesHosted') },
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

  // FR-011: chat and email are independent routes. The email-to-user route is
  // temporarily DISABLED client-side, so only the chat route is offered, and a
  // user with chat disabled is treated as not reachable regardless of their
  // email preference. To re-enable email, restore `showEmail` and the email
  // branch of `showCannotBeReached` (`&& !isContactableViaEmail`).
  const viewerCanContact = Boolean(currentUserId) && !isOwnProfile;
  const showChat = viewerCanContact && isContactable;
  // const showEmail = viewerCanContact && isContactableViaEmail;
  const showCannotBeReached = viewerCanContact && !isContactable;

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
        tagline: profile?.tagline?.trim() || null,
        location,
        showSettingsIcon,
        settingsHref,
        onMessageClick: showChat ? onOpenChat : undefined,
        // Email-to-user contact route temporarily disabled client-side (chat-only).
        // onSendEmail: showEmail ? onSendEmailMessage : undefined,
        onSendEmail: undefined,
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
          referencesTitle: t('userProfile.sidebar.referencesTitle'),
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
