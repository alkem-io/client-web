/**
 * Mock data for the standalone CRD templates preview pages (T088).
 *
 * Shapes mirror the live prop types — see `src/crd/components/templates/types.ts`
 * and `src/crd/components/innovationPack/types.ts`. Banner images come from the
 * prototype's curated Unsplash set; deterministic accent colours come from
 * `pickColorFromId` so the look matches production data.
 */

import type { InnovationPackCardData } from '@/crd/components/innovationPack/types';
import type {
  ReferenceRow,
  TemplateCardData,
  TemplateCategorySection,
  TemplateContent,
} from '@/crd/components/templates/types';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

// ─── Banner images (from prototype/src/app/data/template-data.ts) ─────────────

const PACK_BANNERS = [
  'https://images.unsplash.com/photo-1554103210-26d928978fb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  'https://images.unsplash.com/photo-1631203924388-644782a70944?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  'https://images.unsplash.com/photo-1758691736084-4ef3e6f6a2cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
];

// ─── Template cards by type ──────────────────────────────────────────────────

const card = (
  id: string,
  type: TemplateCardData['type'],
  name: string,
  description: string,
  tags: string[],
  bannerUrl?: string,
  ownerLabel?: string
): TemplateCardData => ({
  id,
  type,
  name,
  description,
  tags,
  bannerUrl,
  color: pickColorFromId(id),
  url: `/templates/${id}`,
  ownerLabel,
});

const SPACE_TEMPLATES: TemplateCardData[] = [
  card(
    'tpl-space-1',
    'space',
    'Design Sprint Kit',
    'A 5-day workshop structure for validating ideas with phases for understand, sketch, decide, prototype, and test.',
    ['Innovation', 'Workshop', 'Strategy'],
    PACK_BANNERS[0]
  ),
  card(
    'tpl-space-2',
    'space',
    'OKR Quarterly Planning',
    'Objectives and key results structure with check-in cadence, retro template, and quarterly review.',
    ['Strategy', 'Planning']
  ),
  card(
    'tpl-space-3',
    'space',
    'Agile Sprint Cycle',
    'Two-week sprint with planning, daily standup, demo, and retrospective phases.',
    ['Agile', 'Engineering', 'Sprint'],
    PACK_BANNERS[1]
  ),
];

const CALLOUT_TEMPLATES: TemplateCardData[] = [
  card(
    'tpl-callout-1',
    'callout',
    'Crazy 8s Brainstorm',
    'Whiteboard-framed callout — eight sketches in eight minutes, one per cell.',
    ['Brainstorm', 'Whiteboard'],
    PACK_BANNERS[2]
  ),
  card(
    'tpl-callout-2',
    'callout',
    'Retro: Start / Stop / Continue',
    'Memo-framed callout with three sections — sprint retro starter.',
    ['Retro', 'Sprint']
  ),
  card(
    'tpl-callout-3',
    'callout',
    'Customer Interview Notes',
    'Document-framed callout with sections for context, key quotes, and follow-ups.',
    ['Research', 'Document']
  ),
  card(
    'tpl-callout-4',
    'callout',
    'Roadmap Vote',
    'Poll-framed callout — pick the top three features for next quarter.',
    ['Roadmap', 'Poll']
  ),
];

const WHITEBOARD_TEMPLATES: TemplateCardData[] = [
  card(
    'tpl-wb-1',
    'whiteboard',
    'Business Model Canvas',
    "Strategyzer's classic nine-block canvas: customer segments, value props, channels, and more.",
    ['Strategy', 'Canvas']
  ),
  card(
    'tpl-wb-2',
    'whiteboard',
    'User Journey Map',
    'Persona, phases, actions, thoughts, feelings — left-to-right swimlane layout.',
    ['UX', 'Journey']
  ),
];

const POST_TEMPLATES: TemplateCardData[] = [
  card(
    'tpl-post-1',
    'post',
    'Weekly Status Update',
    'What we shipped, what we learned, what we are watching.',
    ['Status', 'Weekly']
  ),
  card(
    'tpl-post-2',
    'post',
    'Decision Record',
    'Context, decision, consequences — short architectural decision record format.',
    ['ADR', 'Decision']
  ),
];

const COMMUNITY_GUIDELINES_TEMPLATES: TemplateCardData[] = [
  card(
    'tpl-cg-1',
    'communityGuidelines',
    'Inclusive Community Charter',
    'Code of conduct emphasising psychological safety, respectful debate, and active listening.',
    ['Inclusion', 'Charter']
  ),
];

export const MOCK_TEMPLATE_CATEGORIES: TemplateCategorySection[] = [
  { type: 'space', templates: SPACE_TEMPLATES },
  { type: 'callout', templates: CALLOUT_TEMPLATES },
  { type: 'whiteboard', templates: WHITEBOARD_TEMPLATES },
  { type: 'post', templates: POST_TEMPLATES },
  { type: 'communityGuidelines', templates: COMMUNITY_GUIDELINES_TEMPLATES },
];

export const MOCK_ALL_TEMPLATES: TemplateCardData[] = MOCK_TEMPLATE_CATEGORIES.flatMap(c => c.templates);

// ─── Template content (lazy-loaded preview body) ─────────────────────────────

export const MOCK_TEMPLATE_CONTENT_BY_ID: Record<string, TemplateContent> = {
  'tpl-space-1': {
    type: 'space',
    phases: [
      { name: 'Understand', description: 'Map the problem space with stakeholders.' },
      { name: 'Sketch', description: 'Generate divergent solutions individually.' },
      { name: 'Decide', description: 'Vote on the most promising concepts.' },
      { name: 'Prototype', description: 'Build a realistic facade to test.' },
      { name: 'Test', description: 'Validate with five target users.' },
    ],
    starterCallouts: [
      { name: 'Goal & success metrics', framingKind: 'memo' },
      { name: 'Crazy 8s sketches', framingKind: 'whiteboard' },
      { name: 'Vote on solutions', framingKind: 'poll' },
      { name: 'Customer interview script', framingKind: 'document' },
    ],
    subspaceTemplates: [{ name: 'Test session' }, { name: 'Sprint retro' }],
  },
  'tpl-space-2': {
    type: 'space',
    phases: [
      { name: 'Q-plan', description: 'Set objectives + key results.' },
      { name: 'Mid-quarter', description: 'Check-in on progress.' },
      { name: 'Retro', description: 'What worked, what didn’t.' },
    ],
    starterCallouts: [
      { name: 'Top-level objective', framingKind: 'none' },
      { name: 'Weekly check-in', framingKind: 'memo' },
    ],
    subspaceTemplates: [],
  },
  'tpl-space-3': {
    type: 'space',
    phases: [
      { name: 'Plan', description: 'Sprint planning meeting.' },
      { name: 'Build', description: 'Daily standup + work.' },
      { name: 'Demo', description: 'Showcase to stakeholders.' },
      { name: 'Retro', description: 'Improve the process.' },
    ],
    starterCallouts: [{ name: 'Sprint backlog', framingKind: 'memo' }],
    subspaceTemplates: [{ name: 'Team retro' }],
  },
  'tpl-callout-1': {
    type: 'callout',
    framingKind: 'whiteboard',
    framingTitle: 'Crazy 8s — eight ideas, eight minutes',
    framingDescription: 'Fold a sheet of paper into 8 cells. Sketch one idea per cell, one minute each.',
    framingWhiteboardContent: '{}',
    allowedContributionTypes: ['post'],
    commentsEnabled: true,
  },
  'tpl-callout-2': {
    type: 'callout',
    framingKind: 'memo',
    framingTitle: 'Start / Stop / Continue retro',
    framingDescription: 'Capture the team’s observations in three columns.',
    framingMemoContent: '## Start\n\n## Stop\n\n## Continue',
    allowedContributionTypes: ['post'],
    commentsEnabled: true,
  },
  'tpl-callout-3': {
    type: 'callout',
    framingKind: 'document',
    framingTitle: 'Customer interview notes',
    framingDescription: 'Collaborative document for capturing interview insights.',
    framingCollaboraDoc: { displayName: 'Interview notes', documentType: 'odt' },
    allowedContributionTypes: ['post', 'link'],
    commentsEnabled: false,
  },
  'tpl-callout-4': {
    type: 'callout',
    framingKind: 'poll',
    framingTitle: 'Pick the top 3 features',
    framingDescription: 'Vote for the three features you think we should ship next.',
    framingPoll: {
      question: 'Which features should we ship in Q3?',
      options: ['Inline replies', 'Threaded comments', 'Reactions', 'Mentions', 'Edit history'],
    },
    allowedContributionTypes: [],
    commentsEnabled: true,
  },
  'tpl-wb-1': {
    type: 'whiteboard',
    whiteboardContent: '{}',
    previewImageUrl: PACK_BANNERS[0],
  },
  'tpl-wb-2': {
    type: 'whiteboard',
    whiteboardContent: '{}',
  },
  'tpl-post-1': {
    type: 'post',
    defaultDescription:
      '### This week\n\n- Shipped:\n- Learned:\n- Watching:\n\n### Next week\n\n- Focus:\n- Risks:',
  },
  'tpl-post-2': {
    type: 'post',
    defaultDescription:
      '### Context\n\n_What were we trying to solve?_\n\n### Decision\n\n_What did we choose?_\n\n### Consequences\n\n_What are the trade-offs?_',
  },
  'tpl-cg-1': {
    type: 'communityGuidelines',
    title: 'Inclusive Community Charter',
    guidelinesMarkdown:
      '## Be welcoming\n\nGreet new members. Use inclusive language.\n\n## Disagree, gently\n\nCritique ideas, not people. Assume good faith.\n\n## Listen first\n\nRead the thread before responding. Cite sources.',
    references: [
      { id: 'ref-1', name: 'Contributor Covenant', uri: 'https://www.contributor-covenant.org/', description: '' },
    ],
  },
};

// ─── Innovation packs ────────────────────────────────────────────────────────

const pack = (
  id: string,
  name: string,
  description: string,
  tags: string[],
  templateCount: number,
  providerName: string,
  bannerUrl?: string
): InnovationPackCardData => ({
  id,
  name,
  description,
  tags,
  bannerUrl,
  color: pickColorFromId(id),
  templateCount,
  url: `/innovation-packs/${id}`,
  providerName,
  providerAvatarUrl: undefined,
  providerUrl: `/organization/${providerName.toLowerCase().replace(/\s+/g, '-')}`,
});

export const MOCK_INNOVATION_PACKS: InnovationPackCardData[] = [
  pack(
    'pack-1',
    'Design Sprint Kit',
    'Complete five-day Design Sprint workflow: phases, callouts, and decision frameworks.',
    ['Innovation', 'Workshop', 'Strategy'],
    14,
    'Google Ventures',
    PACK_BANNERS[0]
  ),
  pack(
    'pack-2',
    'Agile Team Rituals',
    'Sprint planning, standups, retros, and demos — everything to start running agile.',
    ['Agile', 'Process'],
    9,
    'Atlassian',
    PACK_BANNERS[1]
  ),
  pack(
    'pack-3',
    'OKR Quarterly Planning',
    'Objectives and key results templates with check-in cadence and quarterly review.',
    ['Strategy', 'Planning'],
    6,
    'HBR'
  ),
  pack(
    'pack-4',
    'User Research Suite',
    'Interview scripts, journey maps, persona templates, and synthesis canvases.',
    ['Research', 'UX'],
    11,
    'Nielsen Norman',
    PACK_BANNERS[2]
  ),
];

// ─── Pack profile (full detail for `InnovationPackProfileView`) ──────────────

const MOCK_PACK_REFERENCES = [
  {
    id: 'ref-pack-1',
    name: 'The Sprint Book (Knapp / Zeratsky / Kowitz)',
    uri: 'https://www.thesprintbook.com',
    description: 'Original Design Sprint methodology.',
  },
  {
    id: 'ref-pack-2',
    name: 'Sprint resources hub',
    uri: 'https://library.gv.com/sprint',
    description: '',
  },
];

export const MOCK_PACK_PROFILE = {
  ...MOCK_INNOVATION_PACKS[0],
  tagline: 'Validate big ideas in five days.',
  references: MOCK_PACK_REFERENCES,
};

// ─── Community-guidelines mock value ─────────────────────────────────────────

export const MOCK_COMMUNITY_GUIDELINES = {
  title: 'Community Charter',
  body: '## Be welcoming\n\nGreet new members. Use inclusive language.\n\n## Disagree, gently\n\nCritique ideas, not people. Assume good faith.\n\n## Listen first\n\nRead the thread before responding. Cite sources.',
  references: [
    { id: 'cg-ref-1', name: 'Contributor Covenant', uri: 'https://www.contributor-covenant.org/', description: '' },
    { id: 'cg-ref-2', name: 'Code of conduct guide', uri: 'https://opensource.guide/code-of-conduct/', description: '' },
  ] as ReferenceRow[],
};
