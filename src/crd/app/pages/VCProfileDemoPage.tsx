import { VCPublicProfileView } from '@/crd/components/virtualContributor/VCPublicProfileView';
import { MOCK_VC_DATASYNTH } from '../data/profiles';

const SIDEBAR_LABELS = {
  descriptionTitle: 'Description',
  hostTitle: 'Host',
  hostEmpty: 'No host.',
  referencesTitle: 'Links',
  referencesEmpty: 'No links yet.',
  bodyOfKnowledgeTitle: 'Body of Knowledge',
  bodyOfKnowledgePrivateTooltip: 'Body of knowledge is private.',
  bodyOfKnowledgeVisitButton: 'Visit',
};

const CONTENT_LABELS = {
  functionalityHeading: 'Functionality',
  capabilitiesTitle: 'Functional Capabilities',
  dataAccessTitle: 'Data access from the Space where it is a member',
  roleRequirementsTitle: 'Role Requirements',
  roleRequirementsMemberRequiredKey: 'crd-profilePages:vcProfile.functionality.roleRequirements.memberRequired',
  roleRequirementsNoneRequired: 'No special member rights required',
  aiEngineHeading: 'AI Engine: Alkemio AI',
  yesAnswer: 'Yes',
  noAnswer: 'No',
  unknownAnswer: 'Unknown',
  technicalReferencesNotAvailable: 'Not available',
};

/**
 * Demo: Virtual Contributor public profile (DataSynth Bot).
 * Renders the redesigned hero (Bot avatar fallback + "Virtual Contributor"
 * type badge + Keywords chip row), the BoK section in the `space` variant,
 * the host card, and the redesigned right column (Functionality / AI Engine /
 * Monitoring). NO Message button (FR-030).
 */
export function VCProfileDemoPage() {
  const vc = MOCK_VC_DATASYNTH;

  return (
    <VCPublicProfileView
      hero={{
        avatarImageUrl: vc.hero.avatarImageUrl,
        displayName: vc.hero.displayName,
        settingsUrl: `/vc/${vc.slug}/settings`,
        typeBadgeLabel: 'Virtual Contributor',
        keywords: vc.hero.keywords,
      }}
      sidebar={{
        description: vc.description,
        host: vc.host,
        references: vc.references,
        bodyOfKnowledge: vc.bodyOfKnowledge,
        labels: SIDEBAR_LABELS,
      }}
      contentView={{
        functionality: vc.functionality,
        aiEngine: vc.aiEngine,
        monitoring: vc.monitoring,
        labels: CONTENT_LABELS,
      }}
      loading={{ hero: false, sidebar: false, bodyOfKnowledge: false, contentView: false }}
      loadingLabels={{
        hero: 'Loading profile header',
        sidebar: 'Loading profile details',
        contentView: 'Loading content',
      }}
    />
  );
}
