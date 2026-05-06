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
  modelCardTitle: 'Model Card',
  aiEngineLabel: 'AI Engine',
  aiEngineExternal: 'External',
  socialLinksTitle: 'Social Links',
  socialLinksEmpty: 'No social links.',
};

/**
 * Demo: Virtual Contributor public profile (DataSynth Bot).
 * Renders the BoK section in the `space` variant, the host card, and the
 * model-card content view. NO Message button (FR-030).
 */
export function VCProfileDemoPage() {
  const vc = MOCK_VC_DATASYNTH;

  return (
    <VCPublicProfileView
      hero={{
        ...vc.hero,
        settingsHref: `/vc/${vc.slug}/settings`,
      }}
      sidebar={{
        description: vc.description,
        host: vc.host,
        references: vc.references,
        bodyOfKnowledge: vc.bodyOfKnowledge,
        labels: SIDEBAR_LABELS,
      }}
      contentView={{
        modelCard: vc.modelCard,
        references: vc.references,
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
