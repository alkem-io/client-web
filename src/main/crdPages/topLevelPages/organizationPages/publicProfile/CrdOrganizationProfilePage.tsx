import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { OrganizationVerificationEnum } from '@/core/apollo/generated/graphql-schema';
import { usePageTitle } from '@/core/routing/usePageTitle';
import type { BreadcrumbTrailItem } from '@/crd/components/common/BreadcrumbsTrail';
import type { ProfileResourceTab, ResourceTabKey } from '@/crd/components/common/ProfileResourceTabStrip';
import { OrganizationPublicProfileView } from '@/crd/components/organization/OrganizationPublicProfileView';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { RoleType } from '@/domain/community/user/constants/RoleType';
import useFilteredMemberships from '@/domain/community/user/hooks/useFilteredMemberships';
import { MetricType } from '@/domain/platform/metrics/MetricType';
import getMetricCount from '@/domain/platform/metrics/utils/getMetricCount';
import { CrdNotFoundView } from '@/main/crdPages/error/CrdNotFoundView';
import { MembershipCardConnector } from '@/main/crdPages/topLevelPages/common/MembershipCardConnector';
import { buildTagsetGroups, normaliseReferences } from '@/main/crdPages/topLevelPages/common/profileMapperHelpers';
import useResourceTabs from '@/main/crdPages/topLevelPages/common/useResourceTabs';
import { useSendMessageToOrganizationHandler } from '@/main/crdPages/topLevelPages/common/useSendMessageHandler';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import { mapAssociates, mapOrgHostedResources } from './organizationProfileMapper';
import { useCrdOrganizationProfilePageData } from './useCrdOrganizationProfilePageData';

export const CrdOrganizationProfilePage = () => {
  const { t } = useTranslation('crd-profilePages');
  const { organization, provided, isAuthenticated, accountResources, loading } = useCrdOrganizationProfilePageData();

  usePageTitle(organization?.profile?.displayName);

  const { onSendMessage } = useSendMessageToOrganizationHandler({
    recipientOrganizationId: organization?.id,
  });

  const { activeTab, onSelectTab } = useResourceTabs('memberOf');

  const tabs: ProfileResourceTab[] = [
    { key: 'memberOf' as ResourceTabKey, label: t('orgProfile.tabs.memberOf') },
    { key: 'leading' as ResourceTabKey, label: t('orgProfile.tabs.leading') },
    { key: 'resourcesHosted' as ResourceTabKey, label: t('orgProfile.tabs.resourcesHosted') },
  ];

  const [leadItems, memberItems] = useFilteredMemberships(provided.contributions ?? [], [RoleType.Lead]);

  const breadcrumbDisplayName = organization?.profile?.displayName ?? '';
  const breadcrumbItems: BreadcrumbTrailItem[] = breadcrumbDisplayName
    ? [{ label: breadcrumbDisplayName, icon: Building2 }]
    : [];
  useSetBreadcrumbs(breadcrumbItems);

  if (!loading.context && !loading.provider && !organization) {
    return <CrdNotFoundView />;
  }

  const heroLoading = loading.context || loading.provider || !organization;
  const sidebarLoading = heroLoading;
  const hostedResourcesLoading = loading.account;
  const membershipsLoading = loading.provider;

  const id = organization?.id ?? '';
  const color = pickColorFromId(id);
  const profile = organization?.profile;

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

  const verified = organization?.verification.status === OrganizationVerificationEnum.VerifiedManualAttestation;

  const settingsHref = provided.permissions.canEdit && profile?.url ? buildSettingsUrl(profile.url) : null;

  const associatesCount = getMetricCount(organization?.metrics ?? [], MetricType.Associate);

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
          associatesSignInCta: t('associates-view.sign-in', { ns: 'crd-common' }),
          associatesShowMore: count => t('associates-view.more', { ns: 'crd-common', count }),
          associatesShowLess: t('associates-view.less', { ns: 'crd-common' }),
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
          templatePacksSubsection: t('common.innovation-packs', { ns: 'crd-common' }),
          customHomepagesSubsection: t('common.customHomepages', { ns: 'crd-common' }),
          spacesLeading: t('orgProfile.sections.spacesLeading'),
          memberOf: t('orgProfile.sections.memberOf'),
          emptyResourcesHosted: t('orgProfile.empty.resourcesHosted'),
          emptyLeading: t('orgProfile.empty.leading'),
          emptyMembership: t('pages.user-profile.communities.noMembership', { ns: 'crd-common' }),
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
