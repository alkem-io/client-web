import { useTranslation } from 'react-i18next';
import {
  useSpaceBodyOfKnowledgeAboutQuery,
  useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery,
  useVirtualContributorProfileWithModelCardQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, VirtualContributorBodyOfKnowledgeType } from '@/core/apollo/generated/graphql-schema';
import { isApolloNotFoundError } from '@/core/apollo/hooks/useApolloErrorHandler';
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import { Error404 } from '@/core/pages/Errors/Error404';
import { usePageTitle } from '@/core/routing/usePageTitle';
import useRestrictedRedirect from '@/core/routing/useRestrictedRedirect';
import { VCPublicProfileView } from '@/crd/components/virtualContributor/VCPublicProfileView';
import useKnowledgeBase from '@/domain/community/virtualContributor/knowledgeBase/useKnowledgeBase';
import { createVirtualContributorModelFull } from '@/domain/community/virtualContributor/utils/createVirtualContributorModelFull';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import {
  computeSettingsHref,
  extractVcKeywords,
  mapHostCard,
  mapVCAiEngine,
  mapVCFunctionality,
  mapVcReferences,
  resolveBodyOfKnowledge,
  VC_MONITORING_SECTION,
} from './vcProfileMapper';

export const CrdVCProfilePage = () => {
  const { t } = useTranslation('crd-profilePages');
  const { t: tBase } = useTranslation();
  const { vcId, loading: urlResolverLoading } = useUrlResolver();
  const { loading: authLoading } = useAuthenticationContext();

  const { data, loading, error } = useVirtualContributorProfileWithModelCardQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { id: vcId! },
    skip: !vcId,
  });

  const isBokSpace =
    data?.lookup.virtualContributor?.bodyOfKnowledgeType === VirtualContributorBodyOfKnowledgeType.AlkemioSpace;
  const isBokKb =
    data?.lookup.virtualContributor?.bodyOfKnowledgeType === VirtualContributorBodyOfKnowledgeType.AlkemioKnowledgeBase;
  const bokId = data?.lookup.virtualContributor?.bodyOfKnowledgeID;

  const { data: vcSpaceBokAuthPrivileges, loading: loadingBokAuth } =
    useSpaceBodyOfKnowledgeAuthorizationPrivilegesQuery({
      // biome-ignore lint/style/noNonNullAssertion: ensured by skip
      variables: { spaceId: bokId! },
      skip: !bokId || !isBokSpace,
    });
  const hasSpaceProfileReadAccess =
    vcSpaceBokAuthPrivileges?.lookup.myPrivileges?.space?.includes(AuthorizationPrivilege.ReadAbout) ?? false;

  const { data: bokProfileData, loading: loadingBokProfile } = useSpaceBodyOfKnowledgeAboutQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { spaceId: bokId! },
    skip: !bokId || !isBokSpace || !hasSpaceProfileReadAccess,
  });

  const {
    knowledgeBaseDescription,
    hasReadAccess: kbHasReadAccess,
    loading: kbLoading,
  } = useKnowledgeBase({
    id: vcId,
  });

  useRestrictedRedirect(
    { data, error, skip: urlResolverLoading || loading },
    d => d.lookup.virtualContributor?.authorization?.myPrivileges,
    { requiredPrivilege: AuthorizationPrivilege.Read }
  );

  usePageTitle(data?.lookup.virtualContributor?.profile?.displayName);

  if (error && isApolloNotFoundError(error)) {
    return <Error404 />;
  }

  // Per-region loading flags (FR-009): each region renders a Skeleton while
  // its underlying queries are in flight, then swaps to real content as data
  // lands.
  const heroLoading = authLoading || urlResolverLoading || loading || !vcId;
  const sidebarLoading = heroLoading;
  const contentViewLoading = heroLoading;
  const bokLoading =
    heroLoading ||
    (isBokSpace && (loadingBokAuth || (hasSpaceProfileReadAccess && loadingBokProfile))) ||
    (isBokKb && kbLoading);

  const virtualContributor = data?.lookup.virtualContributor;
  const vc = createVirtualContributorModelFull(virtualContributor);
  const myPrivileges = virtualContributor?.authorization?.myPrivileges;

  const profile = vc.profile;

  const bokSpaceProfile = isBokSpace ? bokProfileData?.lookup.space?.about.profile : undefined;

  const bodyOfKnowledge = resolveBodyOfKnowledge({
    vc,
    bokSpaceProfile: bokSpaceProfile
      ? { id: bokSpaceProfile.id, displayName: bokSpaceProfile.displayName, url: bokSpaceProfile.url }
      : undefined,
    hasSpaceReadAccess: hasSpaceProfileReadAccess,
    knowledgeBaseDescription: knowledgeBaseDescription ?? undefined,
    knowledgeBasePlaceholder: tBase('virtualContributorSpaceSettings.placeholder'),
    knowledgeBaseHasReadAccess: kbHasReadAccess,
    privateSpaceLabel: tBase('components.card.privacy.private', { entity: 'space' }),
    externalAssistantDescription: tBase('components.profile.fields.engines.externalVCDescription', {
      engineName: tBase('components.profile.fields.engines.externalAssistant'),
    }),
    externalGenericDescription: tBase('components.profile.fields.engines.externalVCDescription', {
      engineName: tBase('components.profile.fields.engines.external'),
    }),
    spaceContextDescription: tBase('components.profile.fields.bodyOfKnowledge.spaceBokDescription', {
      vcName: vc.profile.displayName,
    }),
  });

  const references = mapVcReferences(profile.references);
  const host = mapHostCard(vc);
  const settingsUrl = computeSettingsHref(vc, myPrivileges, buildSettingsUrl);

  // Hero: type badge + Keywords chip row (FR-030).
  // `tagsets` is not on `VirtualContributorModelFull`; read from the raw
  // GraphQL profile (the runtime shape includes tagsets per
  // VirtualContributorProfileWithModelCard.graphql).
  const keywords = extractVcKeywords(virtualContributor?.profile?.tagsets);

  // Right column — redesigned VCContentView (Functionality / AI Engine / Monitoring).
  const contentLabels = {
    capabilitiesTagging: t('vcProfile.functionality.capabilities.tagging'),
    capabilitiesCreateContent: t('vcProfile.functionality.capabilities.createContent'),
    capabilitiesCommunityManagement: t('vcProfile.functionality.capabilities.communityManagement'),
    dataAccessAbout: t('vcProfile.functionality.dataAccess.about'),
    dataAccessContent: t('vcProfile.functionality.dataAccess.content'),
    dataAccessSubspaces: t('vcProfile.functionality.dataAccess.subspaces'),
    engineNameAlkemio: t('vcProfile.aiEngine.engineName.alkemio'),
    engineNameAssistant: t('vcProfile.aiEngine.engineName.assistant'),
    engineNameExternal: t('vcProfile.aiEngine.engineName.external'),
    aiEngineHeadingFor: (engineName: string) => t('vcProfile.aiEngine.heading', { engineName }),
    cards: {
      openModelTransparency: {
        title: t('vcProfile.aiEngine.cards.openModelTransparency.title'),
        description: t('vcProfile.aiEngine.cards.openModelTransparency.description'),
      },
      dataUsageDisclosure: {
        title: t('vcProfile.aiEngine.cards.dataUsageDisclosure.title'),
        description: t('vcProfile.aiEngine.cards.dataUsageDisclosure.description'),
      },
      knowledgeRestriction: {
        title: t('vcProfile.aiEngine.cards.knowledgeRestriction.title'),
        description: t('vcProfile.aiEngine.cards.knowledgeRestriction.description'),
      },
      webAccess: {
        title: t('vcProfile.aiEngine.cards.webAccess.title'),
        description: t('vcProfile.aiEngine.cards.webAccess.description'),
      },
      physicalLocation: {
        title: t('vcProfile.aiEngine.cards.physicalLocation.title'),
        description: t('vcProfile.aiEngine.cards.physicalLocation.description'),
      },
      technicalReferences: {
        title: t('vcProfile.aiEngine.cards.technicalReferences.title'),
        description: t('vcProfile.aiEngine.cards.technicalReferences.description'),
      },
    },
    seeDocumentation: t('vcProfile.aiEngine.seeDocumentation'),
  } as const;

  const functionality = mapVCFunctionality(vc, contentLabels);
  const aiEngine = mapVCAiEngine(vc, contentLabels);

  return (
    <VCPublicProfileView
      hero={{
        avatarImageUrl: profile.avatar?.uri ?? null,
        displayName: profile.displayName,
        settingsUrl,
        typeBadgeLabel: t('vcProfile.typeBadge'),
        keywords,
      }}
      sidebar={{
        description: profile.description ?? null,
        host,
        references,
        bodyOfKnowledge,
        labels: {
          descriptionTitle: t('vcProfile.sidebar.descriptionTitle'),
          hostTitle: t('vcProfile.sidebar.hostTitle'),
          hostEmpty: t('vcProfile.sidebar.hostEmpty'),
          referencesTitle: tBase('components.profile.fields.references.title'),
          referencesEmpty: tBase('common.no-references'),
          bodyOfKnowledgeTitle: tBase('components.profile.fields.bodyOfKnowledge.title'),
          bodyOfKnowledgePrivateTooltip: tBase('components.profile.fields.bodyOfKnowledge.privateBokTooltip'),
          bodyOfKnowledgeVisitButton: tBase('buttons.visit'),
        },
      }}
      contentView={{
        functionality,
        aiEngine,
        monitoring: VC_MONITORING_SECTION,
        labels: {
          functionalityHeading: t('vcProfile.functionality.heading'),
          capabilitiesTitle: t('vcProfile.functionality.capabilities.title'),
          dataAccessTitle: t('vcProfile.functionality.dataAccess.title'),
          roleRequirementsTitle: t('vcProfile.functionality.roleRequirements.title'),
          roleRequirementsMemberRequiredKey: 'crd-profilePages:vcProfile.functionality.roleRequirements.memberRequired',
          roleRequirementsNoneRequired: t('vcProfile.functionality.roleRequirements.noneRequired'),
          aiEngineHeading: t('vcProfile.aiEngine.heading', { engineName: aiEngine.engineName }),
          yesAnswer: t('vcProfile.aiEngine.yes'),
          noAnswer: t('vcProfile.aiEngine.no'),
          unknownAnswer: t('vcProfile.aiEngine.unknown'),
          technicalReferencesNotAvailable: t('vcProfile.aiEngine.notAvailable'),
        },
      }}
      loading={{
        hero: heroLoading,
        sidebar: sidebarLoading,
        bodyOfKnowledge: bokLoading,
        contentView: contentViewLoading,
      }}
      loadingLabels={{
        hero: t('common.loading.hero'),
        sidebar: t('common.loading.sidebar'),
        contentView: t('common.loading.contentView'),
      }}
    />
  );
};

export default CrdVCProfilePage;
