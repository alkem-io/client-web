import { useTranslation } from 'react-i18next';
import { useOrganizationAccountQuery } from '@/core/apollo/generated/apollo-hooks';
import { OrganizationVerificationEnum } from '@/core/apollo/generated/graphql-schema';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { OrganizationPublicProfileView } from '@/crd/components/organization/OrganizationPublicProfileView';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import useAccountResources from '@/domain/community/contributor/useAccountResources/useAccountResources';
import { useOrganizationContext } from '@/domain/community/organization/hooks/useOrganizationContext';
import useOrganizationProvider from '@/domain/community/organization/useOrganization/useOrganization';
import { RoleType } from '@/domain/community/user/constants/RoleType';
import useFilteredMemberships from '@/domain/community/user/hooks/useFilteredMemberships';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { MetricType } from '@/domain/platform/metrics/MetricType';
import getMetricCount from '@/domain/platform/metrics/utils/getMetricCount';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import { useSendMessageToOrganizationHandler } from '../../common/useSendMessageHandler';
import { MembershipCardConnector } from '../../userPages/publicProfile/MembershipCardConnector';
import { buildLocationLine } from '../../userPages/publicProfile/publicProfileMapper';
import { buildTagsetGroups, mapAccountResources, mapAssociates, splitReferences } from './organizationProfileMapper';

export const CrdOrganizationProfilePage = () => {
  const { t } = useTranslation('crd-profilePages');
  const { organization, loading: contextLoading } = useOrganizationContext();
  const provided = useOrganizationProvider();
  const { isAuthenticated } = useCurrentUserContext();

  usePageTitle(organization?.profile?.displayName);

  const { data: organizationAccountData, loading: loadingAccount } = useOrganizationAccountQuery({
    variables: { organizationId: organization?.id ?? '' },
    skip: !organization?.id,
  });
  const accountResources = useAccountResources(organizationAccountData?.lookup.organization?.account?.id);

  const { onSendMessage } = useSendMessageToOrganizationHandler({
    recipientOrganizationId: organization?.id,
  });

  const heroLoading = contextLoading || provided.loading || !organization;
  const sidebarLoading = heroLoading;
  const accountResourcesLoading = loadingAccount;
  const membershipsLoading = provided.loading;

  const id = organization?.id ?? '';
  const color = id ? pickColorFromId(id) : '#42a5f5';
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
    { name: t('orgProfile.sidebar.tagsetKeywords'), tags: provided.keywords },
    { name: t('orgProfile.sidebar.tagsetCapabilities'), tags: provided.capabilities },
  ]);
  const { other: nonSocialReferences, social: socialReferences } = splitReferences(provided.references);
  const associatesGrid = mapAssociates(
    provided.associates.map(a => ({
      id: a.id,
      displayName: a.displayName,
      avatar: a.avatar,
      url: a.url,
    }))
  );

  // Right column
  const accountResourcesGroup = mapAccountResources(accountResources ?? undefined);
  const [leadItems, memberItems] = useFilteredMemberships(provided.contributions ?? [], [RoleType.Lead]);
  const leadSpaces = leadItems.map(item => <MembershipCardConnector key={item.id} contribution={item} />);
  const memberOf = memberItems.map(item => <MembershipCardConnector key={item.id} contribution={item} />);

  return (
    <OrganizationPublicProfileView
      hero={{
        bannerImageUrl: null,
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
        references: nonSocialReferences,
        socialReferences,
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
      rightColumn={{
        accountResources: accountResourcesGroup,
        leadSpaces,
        memberOf,
        labels: {
          accountResourcesTitle: t('orgProfile.rightColumn.accountResourcesTitle'),
          accountResourcesSpacesSubtitle: t('orgProfile.rightColumn.accountResourcesSpacesSubtitle'),
          accountResourcesInnovationPacksSubtitle: t('orgProfile.rightColumn.accountResourcesInnovationPacksSubtitle'),
          accountResourcesInnovationHubsSubtitle: t('orgProfile.rightColumn.accountResourcesInnovationHubsSubtitle'),
          accountResourcesShowAll: t('components.dashboardNavigation.showAll', { ns: 'translation' }),
          leadSpacesTitle: t('orgProfile.rightColumn.leadSpacesTitle'),
          memberOfTitle: t('orgProfile.rightColumn.memberOfTitle'),
          memberOfEmpty: t('pages.user-profile.communities.noMembership', { ns: 'translation' }),
        },
      }}
      loading={{
        hero: heroLoading,
        sidebar: sidebarLoading,
        accountResources: accountResourcesLoading,
        memberships: membershipsLoading,
      }}
    />
  );
};

export default CrdOrganizationProfilePage;
