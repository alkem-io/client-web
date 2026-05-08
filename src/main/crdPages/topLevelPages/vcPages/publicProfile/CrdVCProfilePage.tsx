import { Trans, useTranslation } from 'react-i18next';
import { Error404 } from '@/core/pages/Errors/Error404';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { VCPublicProfileView } from '@/crd/components/virtualContributor/VCPublicProfileView';
import { buildSettingsUrl } from '@/main/routing/urlBuilders';
import { useCrdVCProfilePageData } from './useCrdVCProfilePageData';
import {
  computeSettingsHref,
  extractVcKeywords,
  mapHostCard,
  mapVCAiEngine,
  mapVCFunctionality,
  mapVcReferences,
  resolveBodyOfKnowledge,
} from './vcProfileMapper';

const ALKEMIO_TERMS_HREF = 'https://welcome.alkem.io/legal/#tc';

export const CrdVCProfilePage = () => {
  const { t } = useTranslation('crd-profilePages');
  const { t: tBase } = useTranslation();
  const {
    virtualContributor,
    vc,
    myPrivileges,
    isNotFoundError,
    bokSpaceProfile,
    hasSpaceProfileReadAccess,
    knowledgeBaseDescription,
    kbHasReadAccess,
    loading,
  } = useCrdVCProfilePageData();

  usePageTitle(virtualContributor?.profile?.displayName);

  if (isNotFoundError) {
    return <Error404 />;
  }

  const profile = vc.profile;

  const bodyOfKnowledge = resolveBodyOfKnowledge({
    vc,
    bokSpaceProfile,
    hasSpaceReadAccess: hasSpaceProfileReadAccess,
    knowledgeBaseDescription,
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

  const roleRequirementsContent =
    functionality.roleRequirements.kind === 'memberRequired' ? (
      <p className="text-body text-foreground">
        <Trans
          i18nKey="vcProfile.functionality.roleRequirements.memberRequired"
          ns="crd-profilePages"
          components={{ strong: <strong /> }}
        />
      </p>
    ) : (
      <p className="text-body text-muted-foreground">{t('vcProfile.functionality.roleRequirements.noneRequired')}</p>
    );

  const monitoringBody = (
    <Trans
      i18nKey="vcProfile.monitoring.body"
      ns="crd-profilePages"
      components={{
        a: (
          <a
            href={ALKEMIO_TERMS_HREF}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            {/* href + body provided by the Trans `<a>...</a>` markup */}
          </a>
        ),
      }}
    />
  );

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
          descriptionEmpty: t('vcProfile.sidebar.descriptionEmpty'),
          hostTitle: t('vcProfile.sidebar.hostTitle'),
          hostEmpty: t('vcProfile.sidebar.hostEmpty'),
          referencesTitle: tBase('components.profile.fields.references.title'),
          referencesEmpty: tBase('common.no-references'),
          bodyOfKnowledgeTitle: tBase('components.profile.fields.bodyOfKnowledge.title'),
          bodyOfKnowledgeLoading: t('common.loading.bodyOfKnowledge'),
          bodyOfKnowledgePrivateTooltip: tBase('components.profile.fields.bodyOfKnowledge.privateBokTooltip'),
          bodyOfKnowledgeVisitButton: tBase('buttons.visit'),
        },
      }}
      contentView={{
        functionality,
        roleRequirementsContent,
        aiEngine,
        monitoring: {
          heading: t('vcProfile.monitoring.heading'),
          body: monitoringBody,
        },
        labels: {
          functionalityHeading: t('vcProfile.functionality.heading'),
          capabilitiesTitle: t('vcProfile.functionality.capabilities.title'),
          dataAccessTitle: t('vcProfile.functionality.dataAccess.title'),
          roleRequirementsTitle: t('vcProfile.functionality.roleRequirements.title'),
          aiEngineHeading: t('vcProfile.aiEngine.heading', { engineName: aiEngine.engineName }),
          yesAnswer: t('vcProfile.aiEngine.yes'),
          noAnswer: t('vcProfile.aiEngine.no'),
          unknownAnswer: t('vcProfile.aiEngine.unknown'),
          technicalReferencesNotAvailable: t('vcProfile.aiEngine.notAvailable'),
        },
      }}
      loading={loading}
      loadingLabels={{
        hero: t('common.loading.hero'),
        sidebar: t('common.loading.sidebar'),
        bodyOfKnowledge: t('common.loading.bodyOfKnowledge'),
        contentView: t('common.loading.contentView'),
      }}
    />
  );
};

export default CrdVCProfilePage;
