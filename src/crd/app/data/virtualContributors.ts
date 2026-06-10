/**
 * Mock data for the standalone demo pages of the migrated CRD Virtual
 * Contributor surfaces (creation wizard, Knowledge Base, add-to-community
 * invite + preview, prompt-graph card, VC badge). Mirrors the existing
 * `MOCK_VC_DATASYNTH` pattern in `data/profiles.ts`.
 *
 * NB: These are plain TypeScript values shaped to match the corresponding CRD
 * view-prop types — no GraphQL, no Apollo, no integration layer. The demo
 * pages render the production CRD components directly with this data.
 */

import type { VcInviteItem } from '@/crd/components/community/VirtualContributorInviteDialog';
import type {
  VcWizardCreatedVc,
  VcWizardSelectableSpace,
} from '@/crd/components/virtualContributor/creationWizard/VCCreationWizardView.types';
import type { VcPreviewData } from '@/crd/components/virtualContributor/community/VirtualContributorPreview.types';
import type { VcPromptGraphNode } from '@/crd/components/virtualContributor/settings/VCPromptGraphCard.types';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

/* --------------------------------------------------------------------- */
/*  Creation wizard (US1)                                                 */
/* --------------------------------------------------------------------- */

/** Spaces/subspaces selectable as a Body of Knowledge (existing-space path)
 *  and as the community to add the created VC into (choose-community step). */
export const MOCK_WIZARD_SELECTABLE_SPACES: VcWizardSelectableSpace[] = [
  {
    id: 'space-renewable-energy-grid',
    displayName: 'Renewable Energy Grid',
    color: pickColorFromId('space-renewable-energy-grid'),
    level: 'space',
    subspaces: [
      {
        id: 'subspace-microgrids',
        displayName: 'Microgrid Pilots',
        color: pickColorFromId('subspace-microgrids'),
        level: 'subspace',
      },
      {
        id: 'subspace-storage',
        displayName: 'Energy Storage',
        color: pickColorFromId('subspace-storage'),
        level: 'subspace',
      },
    ],
  },
  {
    id: 'space-smart-traffic',
    displayName: 'Smart Traffic Systems',
    color: pickColorFromId('space-smart-traffic'),
    level: 'space',
  },
  {
    id: 'space-urban-green',
    displayName: 'Urban Green Spaces',
    color: pickColorFromId('space-urban-green'),
    level: 'space',
  },
];

export const MOCK_WIZARD_CREATED_VC: VcWizardCreatedVc = {
  id: 'vc-newly-created',
  name: 'Synthesis Helper',
  profileUrl: '/vc/datasynth-bot',
};

/* --------------------------------------------------------------------- */
/*  Knowledge Base (US2)                                                  */
/* --------------------------------------------------------------------- */

/** Flat identity + description props for `VCKnowledgeBaseView`. The demo page
 *  owns the `calloutsSlot` and the populated/empty + refresh toggles. */
export const MOCK_KB = {
  vcId: 'vc-datasynth',
  displayName: 'DataSynth Bot',
  avatarColor: pickColorFromId('vc-datasynth'),
  description:
    'This knowledge base is sourced from the **Renewable Energy Grid** space. ' +
    'It is refreshed nightly from the latest posts and uploaded documents.',
  lastUpdatedValue: '12 May 2026, 03:00',
};

/* --------------------------------------------------------------------- */
/*  Add-to-community invite + preview (US3)                               */
/* --------------------------------------------------------------------- */

/** Virtual Contributors already on the space's account (added directly). */
export const MOCK_ACCOUNT_VCS: VcInviteItem[] = [
  { id: 'vc-datasynth', displayName: 'DataSynth Bot', subtitle: 'Alkemio AI · Synthetic data' },
  { id: 'vc-policyscanner', displayName: 'PolicyScanner', subtitle: 'Alkemio AI · Document analysis' },
];

/** Virtual Contributors from the shared library (invited with a message). */
export const MOCK_LIBRARY_VCS: VcInviteItem[] = [
  { id: 'vc-research-assistant', displayName: 'Research Assistant', subtitle: 'Community library' },
  { id: 'vc-facilitator-bot', displayName: 'Facilitator Bot', subtitle: 'Community library' },
  { id: 'vc-summary-bot', displayName: 'Summary Bot', subtitle: 'Community library' },
];

/** Detail preview shown after selecting a VC in the invite dialog. Keyed by id
 *  so the demo can resolve the right preview for whichever row is opened. */
export const MOCK_VC_PREVIEWS: Record<string, VcPreviewData> = {
  'vc-datasynth': {
    id: 'vc-datasynth',
    displayName: 'DataSynth Bot',
    tags: ['Synthetic data', 'Urban modeling', 'Research'],
    description:
      'DataSynth generates synthetic datasets for urban-modeling research. It works from a curated ' +
      'base of city-scale knowledge ingested from the host space.',
    host: { id: 'host-cityscale', displayName: 'CityScale', href: '/organization/cityscale' },
  },
  'vc-policyscanner': {
    id: 'vc-policyscanner',
    displayName: 'PolicyScanner',
    tags: ['Document analysis', 'Policy'],
    description: 'Scans municipal meeting minutes and policy texts for sustainability commitments.',
    host: { id: 'host-cityscale', displayName: 'CityScale', href: '/organization/cityscale' },
  },
  'vc-research-assistant': {
    id: 'vc-research-assistant',
    displayName: 'Research Assistant',
    tags: ['Research', 'Summarization'],
    description:
      'A general-purpose research assistant that answers questions grounded in the space knowledge base.',
    host: { id: 'host-alkemio', displayName: 'Alkemio Foundation', href: '/organization/alkemio' },
  },
  'vc-facilitator-bot': {
    id: 'vc-facilitator-bot',
    displayName: 'Facilitator Bot',
    tags: ['Facilitation', 'Workshops'],
    description: 'Helps facilitate collaborative sessions by prompting next steps and summarizing decisions.',
  },
  'vc-summary-bot': {
    id: 'vc-summary-bot',
    displayName: 'Summary Bot',
    tags: ['Summarization'],
    description: 'Produces concise summaries of long discussion threads on demand.',
  },
};

/* --------------------------------------------------------------------- */
/*  Prompt-graph card (US4)                                               */
/* --------------------------------------------------------------------- */

/** Linear START→END node sequence: two system (locked) nodes and one editable
 *  user node, exercising read-only vs. editable rendering + property tables. */
export const MOCK_PROMPT_GRAPH_NODES: VcPromptGraphNode[] = [
  {
    name: 'START',
    system: true,
    outputProperties: [
      { name: 'question', type: 'string', optional: false, description: 'The end-user question.' },
      { name: 'context', type: 'object', optional: true, description: 'Retrieved knowledge-base context.' },
    ],
  },
  {
    name: 'Answer',
    system: false,
    inputVariables: ['question', 'context'],
    prompt:
      'You are a helpful assistant. Answer the {{question}} using only the supplied {{context}}. ' +
      'If the answer is not in the context, say you do not know.',
    outputProperties: [
      { name: 'answer', type: 'string', optional: false, description: 'The generated answer.' },
      { name: 'confidence', type: 'string', optional: true, description: 'Self-reported confidence level.' },
    ],
  },
  {
    name: 'END',
    system: true,
    inputVariables: ['answer'],
    outputProperties: [{ name: 'answer', type: 'string', optional: false, description: 'Final answer returned.' }],
  },
];
