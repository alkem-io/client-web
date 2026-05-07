import { useTranslation } from 'react-i18next';
import { OrganizationVerificationEnum } from '@/core/apollo/generated/graphql-schema';
import { Error404 } from '@/core/pages/Errors/Error404';
import { usePageTitle } from '@/core/routing/usePageTitle';
import type { ProfileResourceTab, ResourceTabKey } from '@/crd/components/common/ProfileResourceTabStrip';
import { OrganizationPublicProfileView } from '@/crd/components/organization/OrganizationPublicProfileView';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { RoleType } from '@/domain/community/user/constants/RoleType';
import useFilteredMemberships from '@/domain/community/user/hooks/useFilteredMemberships';
import { MetricType } from '@/domain/platform/metrics/MetricType';
import getMetricCount from '@/domain/platform/metrics/utils/getMetricCount';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import { MembershipCardConnector } from '../../common/MembershipCardConnector';
import { buildLocationLine, buildTagsetGroups, normaliseReferences } from '../../common/profileMapperHelpers';
import useResourceTabs from '../../common/useResourceTabs';
import { useSendMessageToOrganizationHandler } from '../../common/useSendMessageHandler';
import { mapAssociates, mapOrgHostedResources } from './organizationProfileMapper';
import { useCrdOrganizationProfilePageData } from './useCrdOrganizationProfilePageData';

export const CrdOrganizationProfilePage = () => {
  const { t } = useTranslation('crd-profilePages');
  const { organization, provided, isAuthenticated, accountResources, loading } = useCrdOrganizationProfilePageData();

  usePageTitle(organization?.profile?.displayName);

  const { onSendMessage } = useSendMessageToOrganizationHandler({
    recipientOrganizationId: organization?.id,
  });

  const { activeTab, onSelectTab } = useResourceTabs();

  const tabs: ProfileResourceTab[] = [
    { key: 'resourcesHosted' as ResourceTabKey, label: t('orgProfile.tabs.resourcesHosted') },
    { key: 'leading' as ResourceTabKey, label: t('orgProfile.tabs.leading') },
    { key: 'memberOf' as ResourceTabKey, label: t('orgProfile.tabs.memberOf') },
  ];

  // Memberships filter MUST run on every render (rules of hooks) — derive
  // it before the 404 early-return below.
  const [leadItems, memberItems] = useFilteredMemberships(provided.contributions ?? [], [RoleType.Lead]);

  // 404 — context + provider have both resolved but no organization came back
  // (deleted / unreadable org). Without this, heroLoading stays true forever
  // and the page sits on a permanent skeleton.
  if (!loading.context && !loading.provider && !organization) {
    return <Error404 />;
  }

  const heroLoading = loading.context || loading.provider || !organization;
  const sidebarLoading = heroLoading;
  const hostedResourcesLoading = loading.account;
  const membershipsLoading = loading.provider;

  const id = organization?.id ?? '';
  const color = pickColorFromId(id);
  const profile = organization?.profile;

  const location = buildLocationLine(
    profile?.location?.city,
    profile?.location?.country,
    vars => t('common.locationFormat', vars),
    vars => t('common.locationCityOnly', vars),
    vars => t('common.locationCountryOnly', vars)
  );

  const verified = organization?.verification.status === OrganizationVerificationEnum.VerifiedManualAttestation;

  const settingsHref = provided.permissions.canEdit && profile?.url ? buildSettingsUrl(profile.url) : null;

  const associatesCount = getMetricCount(organization?.metrics ?? [], MetricType.Associate);

  // Sidebar pieces
  const tagsets = buildTagsetGroups([
    { key: 'keywords', name: t('orgProfile.sidebar.tagsetKeywords'), tags: provided.keywords },
    { key: 'capabilities', name: t('orgProfile.sidebar.tagsetCapabilities'), tags: provided.capabilities },
  ]);
  const references = normaliseReferences(provided.references);
  const associatesGrid = mapAssociates(
    provided.associates.map(a => ({
      id: a.id,
      displayName: a.displayName,
      avatar: a.avatar,
      url: a.url,
    }))
  );

  // Right column — 4 hosted-resource sub-sections + Lead Spaces + Member Of.
  const { hostedSpaces, hostedVirtualContributors, hostedInnovationPacks, hostedInnovationHubs } =
    mapOrgHostedResources(accountResources, t('orgProfile.vcType'));
  const leadSpaces = leadItems.map(item => <MembershipCardConnector key={item.id} contribution={item} />);
  const memberOf = memberItems.map(item => <MembershipCardConnector key={item.id} contribution={item} />);

  return (
    <OrganizationPublicProfileView
      hero={{
        avatarImageUrl: profile?.avatar?.uri ?? null,
        color,
        displayName: profile?.displayName ?? '',
        location,
        verified,
        settingsHref,
        onSendMessage: isAuthenticated ? onSendMessage : null,
      }}
      sidebar={{
        bio: profile?.description ?? null,
        tagsets,
        references,
        associates: {
          associates: associatesGrid,
          totalCount: associatesCount,
          canReadUsers: provided.permissions.canReadUsers,
        },
        labels: {
          bioTitle: t('orgProfile.sidebar.bioTitle'),
          bioEmpty: t('orgProfile.sidebar.bioEmpty'),
          referencesTitle: t('orgProfile.sidebar.referencesTitle'),
          referencesEmpty: t('orgProfile.sidebar.referencesEmpty'),
          associatesTitle: count => t('orgProfile.sidebar.associatesCount', { count }),
          associatesSignInCta: t('associates-view.sign-in', { ns: 'translation' }),
          associatesShowMore: count => t('associates-view.more', { ns: 'translation', count }),
          associatesShowLess: t('associates-view.less', { ns: 'translation' }),
          socialLinksTitle: t('orgProfile.sidebar.socialLinksTitle'),
        },
      }}
      tabStrip={{
        tabs,
        activeTab,
        onSelectTab,
        ariaLabel: t('common.resourceTabsAriaLabel'),
      }}
      rightColumn={{
        activeTab,
        hostedSpaces,
        hostedVirtualContributors,
        hostedInnovationPacks,
        hostedInnovationHubs,
        leadSpaces,
        memberOf,
        labels: {
          spacesSubsection: t('orgProfile.sections.spacesSubsection'),
          virtualContributorsSubsection: t('orgProfile.sections.virtualContributorsSubsection'),
          // FR-102 parity reuse: pulled from the global `translation` namespace
          // (existing keys), not duplicated under `crd-profilePages`.
          templatePacksSubsection: t('common.innovation-packs', { ns: 'translation' }),
          customHomepagesSubsection: t('common.customHomepages', { ns: 'translation' }),
          spacesLeading: t('orgProfile.sections.spacesLeading'),
          memberOf: t('orgProfile.sections.memberOf'),
          emptyLeading: t('orgProfile.empty.leading'),
          emptyMembership: t('pages.user-profile.communities.noMembership', { ns: 'translation' }),
          spacePrivacy: {
            privacyPrivate: t('common.spacePrivacy.private'),
            privacyPublic: t('common.spacePrivacy.public'),
          },
        },
      }}
      loading={{
        hero: heroLoading,
        sidebar: sidebarLoading,
        hostedResources: hostedResourcesLoading,
        memberships: membershipsLoading,
      }}
      loadingLabels={{
        hero: t('common.loading.hero'),
        sidebar: t('common.loading.sidebar'),
        hostedResources: t('common.loading.hostedResources'),
        memberships: t('common.loading.memberships'),
      }}
    />
  );
};

export default CrdOrganizationProfilePage;
