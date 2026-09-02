import { VCPublicProfileView } from '@/crd/components/virtualContributor/VCPublicProfileView';
import { MOCK_VC_DATASYNTH } from '../data/profiles';

const SIDEBAR_LABELS = {
  descriptionTitle: 'Description',
  descriptionEmpty: 'No description provided.',
  hostTitle: 'Host',
  hostEmpty: 'No host.',
  referencesTitle: 'Links',
  referencesEmpty: 'No links yet.',
  bodyOfKnowledgeTitle: 'Body of Knowledge',
  bodyOfKnowledgeLoading: 'Loading body of knowledge',
  bodyOfKnowledgePrivateTooltip: 'Body of knowledge is private.',
  bodyOfKnowledgeVisitButton: 'Visit',
};

const CONTENT_LABELS = {
  functionalityHeading: 'Functionality',
  capabilitiesTitle: 'Functional Capabilities',
  dataAccessTitle: 'Data access from the Space where it is a member',
  roleRequirementsTitle: 'Role Requirements',
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

  const roleRequirementsContent =
    vc.functionality.roleRequirements.kind === 'memberRequired' ? (
      <p className="text-body text-foreground">
        This VC needs to be granted <strong>member rights</strong> to operate in the space.
      </p>
    ) : (
      <p className="text-body text-muted-foreground">No special member rights required</p>
    );

  const monitoringBody = (
    <p>
      Usage is monitored by Alkemio per the{' '}
      <a
        href="https://welcome.alkem.io/legal/#tc"
        target="_blank"
        rel="noreferrer"
        className="text-primary underline-offset-4 hover:underline"
      >
        Terms &amp; Conditions
      </a>
      .
    </p>
  );

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
        roleRequirementsContent,
        aiEngine: vc.aiEngine,
        monitoring: { heading: 'Monitoring by Alkemio', body: monitoringBody },
        labels: CONTENT_LABELS,
      }}
      loading={{ hero: false, sidebar: false, bodyOfKnowledge: false, contentView: false }}
      loadingLabels={{
        hero: 'Loading profile header',
        sidebar: 'Loading profile details',
        bodyOfKnowledge: 'Loading body of knowledge',
        contentView: 'Loading content',
      }}
    />
  );
}
