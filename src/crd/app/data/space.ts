import type { CalloutDetailDialogData } from '@/crd/components/callout/CalloutDetailDialog';
import type { PostCardData } from '@/crd/components/space/PostCard';
import type { SpaceCardData } from '@/crd/components/space/SpaceCard';
import type { MemberCardData } from '@/crd/components/space/SpaceMembers';
import type { CommentData } from '@/crd/components/comment/types';

// ── Avatars ──────────────────────────────────────────

export const AVATARS = {
  sarah:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  david:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  elena:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  alex: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  maya: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  robert:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
};

const BANNER_URL =
  'https://images.unsplash.com/photo-1690191863988-f685cddde463?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBjaGFsbGVuZ2UlMjBjcmVhdGl2ZSUyMHdvcmtzaG9wJTIwdGVhbSUyMGNvbGxhYm9yYXRpb24lMjBpbm5vdmF0aW9uJTIwc3ByaW50JTIwZGVzaWduJTIwc3ByaW50fGVufDF8fHx8MTc2OTA5NDMxMHww&ixlib=rb-4.1.0&q=80&w=1080';

const WB1 = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1080';
const WB2 = 'https://images.unsplash.com/photo-1574359219611-a3031f074b2c?auto=format&fit=crop&q=80&w=1080';
const WB3 = 'https://images.unsplash.com/photo-1578401058525-35aaec0b4658?auto=format&fit=crop&q=80&w=1080';
const WB4 = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1080';

// ── Space Header ─────────────────────────────────────

export const MOCK_SPACE_BANNER = {
  title: 'Green Energy Space',
  tagline: 'Collaborating on the future of sustainable energy solutions and urban transformation.',
  bannerUrl: BANNER_URL,
  isHomeSpace: false,
  memberAvatars: [
    { id: 'u1', url: AVATARS.sarah, initials: 'SC' },
    { id: 'u2', url: AVATARS.david, initials: 'DM' },
    { id: 'u3', url: AVATARS.elena, initials: 'ER' },
    { id: 'u4', url: AVATARS.alex, initials: 'AC' },
    { id: 'u5', url: AVATARS.maya, initials: 'MR' },
  ],
  memberCount: 29,
};

// ── Tabs ─────────────────────────────────────────────

export const MOCK_TABS = [
  { index: 0, label: 'Home' },
  { index: 1, label: 'Community' },
  { index: 2, label: 'Subspaces' },
  { index: 3, label: 'Knowledge Base' },
];

// ── Posts / Callouts ─────────────────────────────────

const MEMO_FRAMING_MARKDOWN = `## Q2 Strategy Review — Working Notes

This memo tracks decisions and open questions from the Q2 strategy session. **Live-edit this document collaboratively.**

### Priorities for next quarter
1. Finalise the municipal partnership MoU with Amsterdam and Utrecht
2. Scope the community-solar pilot for two residential districts
3. Publish the Q1 sustainability report with supporting data

### Open questions
- Do we have capacity to lead the EU consortium application before August?
- Is the proposed governance model compatible with existing member agreements?
- Who owns storage-integration requirements for the grid modernisation track?

### Next steps
- [x] Circulate this memo for async review
- [ ] Consolidate feedback by Friday
- [ ] Present consolidated plan at the May all-hands
`;

export const MOCK_POSTS: PostCardData[] = [
  {
    id: 'p1',
    type: 'text',
    author: { name: 'Sarah Chen', avatarUrl: AVATARS.sarah, profileUrl: '/user/sarah-chen' },
    title: 'Kickoff: Municipal Transition Strategy',
    snippet:
      'We are officially launching the strategy phase for the 2030 renewable transition. Our goal is to outline a clear path for municipalities to reach 100% renewable energy. Please review the initial policy draft.',
    timestamp: '2 hours ago',
    commentCount: 5,
  },
  {
    id: 'p2',
    type: 'text',
    author: { name: 'Alex Contributor', avatarUrl: AVATARS.alex, profileUrl: '/user/alex-contributor' },
    title: 'Call for Ideas: Community Solar Projects',
    snippet:
      'We need innovative concepts for integrating solar into existing municipal infrastructure. Please sketch out your ideas for public buildings, parking lots, and open spaces.',
    timestamp: '3 hours ago',
    isDraft: true,
    commentCount: 8,
  },
  {
    id: 'p3',
    type: 'whiteboard',
    author: { name: 'David Miller', avatarUrl: AVATARS.david, profileUrl: '/user/david-miller' },
    title: 'Brainstorming: Municipal Infrastructure Upgrades',
    snippet:
      'Outputs from our session on grid modernization. Key clusters include smart metering, battery storage integration, and EV charging networks.',
    timestamp: '5 hours ago',
    framingImageUrl: WB3,
    commentCount: 3,
  },
  {
    id: 'p-memo-framing',
    type: 'memo',
    author: { name: 'Elena Rodriguez', avatarUrl: AVATARS.elena, profileUrl: '/user/elena-rodriguez' },
    title: 'Q2 Strategy Review — Collaborative Memo',
    snippet:
      'A shared memo capturing decisions and open questions from our Q2 strategy session. Click to open the collaborative editor.',
    timestamp: '6 hours ago',
    isDraft: true,
    framingMemoMarkdown: MEMO_FRAMING_MARKDOWN,
    commentCount: 4,
  },
  {
    id: 'p-memo-contribs',
    type: 'text',
    author: { name: 'Sarah Chen', avatarUrl: AVATARS.sarah, profileUrl: '/user/sarah-chen' },
    title: 'Share your municipal case study (memo contributions)',
    snippet:
      'We are collecting short memos from each partner municipality describing local constraints, wins, and lessons. Add your memo below or open an existing one to co-edit.',
    timestamp: '8 hours ago',
    commentCount: 9,
  },
  {
    id: 'p4',
    type: 'text',
    author: { name: 'Elena Rodriguez', avatarUrl: AVATARS.elena, profileUrl: '/user/elena-rodriguez' },
    title: 'Transition Case Studies & Policy Docs',
    snippet:
      'A collection of successful case studies from similar sized municipalities reaching 100% renewables. Essential reading for the strategy team.',
    timestamp: '1 day ago',
    commentCount: 12,
  },
  // ── Post with rich description + tags ──────────────────────────
  {
    id: 'p-rich-description',
    type: 'text',
    author: { name: 'Robert Fox', avatarUrl: AVATARS.robert, profileUrl: '/user/robert-fox' },
    title: 'Comparative Analysis: EU Renewable Directives',
    snippet:
      'A comparative study of EU member-state approaches to the Renewable Energy Directive (RED III) and implications for our municipal framework.\n\n| Country | Target (2030) | Current | Gap |\n|---------|:---:|:---:|:---:|\n| Netherlands | 35% | 22% | 13% |\n| Germany | 80% | 46% | 34% |\n| Denmark | 100% | 80% | 20% |\n| Spain | 42% | 28% | 14% |\n\n> "The most effective programs combine regulatory mandates with community-level incentives." — IEA Report 2025\n\n![Solar panel installation](https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80)\n\nKey takeaways:\n- **Front-runner countries** leverage tax credits + feed-in tariffs simultaneously\n- **Community ownership models** consistently outperform top-down approaches\n- Grid infrastructure is the binding constraint in most geographies',
    timestamp: '1 day ago',
    tags: ['policy', 'EU-directive', 'renewable-energy', 'RED-III', 'comparative-analysis'],
    commentCount: 7,
  },
  // ── Post with tags only (no rich description) ─────────────────
  {
    id: 'p-tags-only',
    type: 'text',
    author: { name: 'Maya Ross', avatarUrl: AVATARS.maya, profileUrl: '/user/maya-ross' },
    title: 'Funding Opportunities: Horizon Europe Call 2026',
    snippet:
      'New call published for sustainable energy demonstrations in urban areas. Deadline: September 15. Max consortium size: 8 partners. We should coordinate a joint application with our municipal network.',
    timestamp: '2 days ago',
    tags: ['funding', 'horizon-europe', 'deadline-september', 'consortium'],
    commentCount: 0,
  },
  // ── Post with references (links and files) ─────────────────────
  {
    id: 'p-references',
    type: 'text',
    author: { name: 'David Miller', avatarUrl: AVATARS.david, profileUrl: '/user/david-miller' },
    title: 'Resource Pack: Grid Modernisation Standards',
    snippet:
      'Compiled the key reference documents and tools we need for the grid modernisation track. All files are in the shared drive — links below for quick access.',
    timestamp: '2 days ago',
    tags: ['grid', 'standards', 'resources'],
    references: [
      { id: 'ref-1', name: 'IEC 61850 Communication Networks Guide', uri: 'https://example.com/iec-61850-guide.pdf', isFile: true },
      { id: 'ref-2', name: 'EU Smart Grid Reference Architecture', uri: 'https://ec.europa.eu/energy/smart-grids', description: 'Official EU reference for interoperability' },
      { id: 'ref-3', name: 'Grid Capacity Assessment Tool (v2.4)', uri: 'https://example.com/grid-tool-v2.4.xlsx', isFile: true },
      { id: 'ref-4', name: 'TenneT Connection Requirements 2026', uri: 'https://tennet.eu/connection-requirements-2026' },
    ],
    commentCount: 4,
  },
  // ── Media Gallery framing ──────────────────────────────────────
  {
    id: 'p-media-gallery',
    type: 'mediaGallery',
    author: { name: 'Alex Contributor', avatarUrl: AVATARS.alex, profileUrl: '/user/alex-contributor' },
    title: 'Site Visit: Amsterdam North Solar District',
    snippet:
      'Photos from our site visit to the Amsterdam North pilot district. Rooftop installations across 3 residential blocks and the community centre. The integration quality is impressive — barely visible from street level.',
    timestamp: '3 days ago',
    framingMediaGallery: {
      thumbnails: [
        { id: 'mg-1', url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80', alternativeText: 'Rooftop solar panels on residential block' },
        { id: 'mg-2', url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=600&q=80', alternativeText: 'Solar panel close-up' },
        { id: 'mg-3', url: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=600&q=80', alternativeText: 'Community centre with integrated panels' },
        { id: 'mg-4', url: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?auto=format&fit=crop&w=600&q=80', alternativeText: 'Street-level view showing minimal visibility' },
      ],
      totalCount: 12,
    },
    tags: ['site-visit', 'amsterdam', 'solar', 'photography'],
    commentCount: 6,
  },
  // ── Document framing (Collabora) ───────────────────────────────
  {
    id: 'p-document',
    type: 'document',
    author: { name: 'Elena Rodriguez', avatarUrl: AVATARS.elena, profileUrl: '/user/elena-rodriguez' },
    title: '2030 Renewable Transition Policy Proposal',
    snippet:
      'The latest draft of our comprehensive policy proposal is ready for collaborative editing. It covers the full strategic framework including grid modernization, community solar, building electrification, and fleet conversion.',
    timestamp: '3 days ago',
    isDraft: true,
    framingDocumentType: 'text',
    tags: ['policy', 'strategy', 'draft-v3'],
    references: [
      { id: 'ref-doc-1', name: 'Previous version (v2.1)', uri: 'https://example.com/policy-v2.1.docx', isFile: true },
      { id: 'ref-doc-2', name: 'Stakeholder feedback summary', uri: 'https://example.com/feedback-summary.pdf', isFile: true },
    ],
    commentCount: 14,
  },
  // ── Call to Action framing ─────────────────────────────────────
  {
    id: 'p-call-to-action',
    type: 'callToAction',
    author: { name: 'Sarah Chen', avatarUrl: AVATARS.sarah, profileUrl: '/user/sarah-chen' },
    title: 'Register: Municipal Leaders Workshop — June 12',
    snippet:
      'Our quarterly workshop for municipal leaders is coming up. This session focuses on practical implementation challenges and peer-to-peer knowledge exchange. Attendance is free for all space members.',
    timestamp: '4 days ago',
    framingCallToAction: {
      uri: 'https://example.com/register-workshop-june',
      displayName: 'Register for Workshop',
      isExternal: true,
      isValid: true,
    },
    tags: ['workshop', 'event', 'municipal-leaders'],
    commentCount: 2,
  },
  // ── Poll framing ───────────────────────────────────────────────
  {
    id: 'p-poll',
    type: 'poll',
    author: { name: 'Maya Ross', avatarUrl: AVATARS.maya, profileUrl: '/user/maya-ross' },
    title: 'Priority Poll: Next Quarter Focus Area',
    snippet:
      'Help us decide what the community should prioritize for Q3. Vote for the initiative that you think will have the most impact. Results will guide our resource allocation.',
    timestamp: '4 days ago',
    tags: ['poll', 'planning', 'Q3'],
    commentCount: 11,
  },
  // ── Whiteboard + tags + references ─────────────────────────────
  {
    id: 'p-whiteboard-full',
    type: 'whiteboard',
    author: { name: 'David Miller', avatarUrl: AVATARS.david, profileUrl: '/user/david-miller' },
    title: 'System Architecture: Smart Grid Integration Layer',
    snippet:
      'Visual diagram mapping the integration layer between municipal smart meters, battery storage, and the national grid operator API. Open the whiteboard to explore the full architecture.',
    timestamp: '5 days ago',
    framingImageUrl: WB1,
    tags: ['architecture', 'smart-grid', 'integration', 'technical'],
    references: [
      { id: 'ref-wb-1', name: 'API Specification (OpenAPI 3.1)', uri: 'https://example.com/grid-api-spec.yaml', isFile: true },
      { id: 'ref-wb-2', name: 'TenneT Developer Portal', uri: 'https://developer.tennet.eu' },
    ],
    commentCount: 5,
  },
  // ── Memo + tags + references ───────────────────────────────────
  {
    id: 'p-memo-full',
    type: 'memo',
    author: { name: 'Robert Fox', avatarUrl: AVATARS.robert, profileUrl: '/user/robert-fox' },
    title: 'Meeting Notes: Stakeholder Alignment Session',
    snippet:
      'Notes from the alignment session with regional energy authorities. Key decisions on governance structure and phasing approach captured below.',
    timestamp: '5 days ago',
    framingMemoMarkdown: `## Stakeholder Alignment Session — May 15\n\n**Attendees**: Sarah Chen, David Miller, Elena Rodriguez, Robert Fox, Municipal delegates (×6)\n\n### Key Decisions\n1. **Governance**: Steering committee meets bi-weekly; working groups report monthly\n2. **Phasing**: Start with 3 pilot municipalities in Q3, expand to full network in Q1 2027\n3. **Budget**: €2.4M allocated for Phase 1; contingency reserve of 15%\n\n### Open Items\n- [ ] Legal review of data-sharing agreements (due: June 1)\n- [ ] Confirm grid capacity with TenneT for pilot districts\n- [ ] Align on KPI dashboard metrics with all partners\n\n### Next Meeting\nJune 5, 14:00 CET — focus on technical workstream kickoff`,
    tags: ['meeting-notes', 'stakeholders', 'governance', 'decisions'],
    references: [
      { id: 'ref-memo-1', name: 'Governance Framework (draft)', uri: 'https://example.com/governance-draft.pdf', isFile: true },
      { id: 'ref-memo-2', name: 'Previous session notes (April)', uri: 'https://example.com/notes-april.pdf', isFile: true },
    ],
    commentCount: 6,
  },
  // ── Media Gallery + description + comments ─────────────────────
  {
    id: 'p-media-gallery-event',
    type: 'mediaGallery',
    author: { name: 'Maya Ross', avatarUrl: AVATARS.maya, profileUrl: '/user/maya-ross' },
    title: 'Event Recap: Community Solar Launch Day',
    snippet:
      'What an incredible turnout! Over 200 residents joined us for the official launch of the community solar co-op in Utrecht West. Here are the highlights from the day.',
    timestamp: '1 week ago',
    framingMediaGallery: {
      thumbnails: [
        { id: 'mg-evt-1', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80', alternativeText: 'Crowd at launch event' },
        { id: 'mg-evt-2', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80', alternativeText: 'Panel discussion' },
        { id: 'mg-evt-3', url: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=600&q=80', alternativeText: 'Solar panel unveiling' },
        { id: 'mg-evt-4', url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80', alternativeText: 'Networking session' },
      ],
      totalCount: 34,
    },
    tags: ['event', 'community-solar', 'utrecht', 'launch'],
    commentCount: 18,
  },
  // ── Document (spreadsheet) + references ────────────────────────
  {
    id: 'p-document-spreadsheet',
    type: 'document',
    author: { name: 'Robert Fox', avatarUrl: AVATARS.robert, profileUrl: '/user/robert-fox' },
    title: 'Municipal Budget Model FY2027–2030',
    snippet:
      'The updated budget model incorporating revised subsidy figures from the national energy fund. Includes scenario analysis for three deployment speeds (conservative, moderate, aggressive).',
    timestamp: '1 week ago',
    framingDocumentType: 'spreadsheet',
    tags: ['budget', 'financial-model', 'scenarios'],
    references: [
      { id: 'ref-budget-1', name: 'National Energy Fund Guidelines 2026', uri: 'https://example.com/nef-guidelines-2026.pdf', isFile: true },
      { id: 'ref-budget-2', name: 'Previous model (FY2025–2028)', uri: 'https://example.com/budget-model-old.xlsx', isFile: true },
    ],
    commentCount: 8,
  },
  // ── Call to Action (internal link) ─────────────────────────────
  {
    id: 'p-cta-internal',
    type: 'callToAction',
    author: { name: 'Elena Rodriguez', avatarUrl: AVATARS.elena, profileUrl: '/user/elena-rodriguez' },
    title: 'Take the Readiness Assessment',
    snippet:
      'Before we begin Phase 2, each partner municipality should complete the readiness assessment. It takes about 15 minutes and covers infrastructure, governance, and community engagement preparedness.',
    timestamp: '1 week ago',
    framingCallToAction: {
      uri: '/space/innovation-lab/readiness-assessment',
      displayName: 'Start Assessment',
      isExternal: false,
      isValid: true,
    },
    commentCount: 5,
  },
  // ── Text post with whiteboard contributions preview ────────────
  {
    id: 'p-wb-contributions',
    type: 'text',
    author: { name: 'Alex Contributor', avatarUrl: AVATARS.alex, profileUrl: '/user/alex-contributor' },
    title: 'Design Sprint: Citizen Engagement Touchpoints',
    snippet:
      'Submit your whiteboard sketches for citizen-facing touchpoints in the energy dashboard. We need at least 3 concepts for the resident portal, mobile alerts, and neighbourhood displays.',
    timestamp: '1 week ago',
    isDraft: true,
    tags: ['design-sprint', 'UX', 'citizen-engagement'],
    commentCount: 15,
  },
  // ── Document (presentation) ────────────────────────────────────
  {
    id: 'p-document-presentation',
    type: 'document',
    author: { name: 'Sarah Chen', avatarUrl: AVATARS.sarah, profileUrl: '/user/sarah-chen' },
    title: 'Stakeholder Presentation — May All-Hands',
    snippet:
      'Slide deck for the May all-hands meeting covering Q2 progress, Q3 roadmap, and budget reallocation proposals. Please add your section by Wednesday.',
    timestamp: '2 weeks ago',
    framingDocumentType: 'presentation',
    tags: ['presentation', 'all-hands', 'Q2-review'],
    commentCount: 3,
  },
  // ── Text post with post-type contributions ─────────────────────
  {
    id: 'p-post-contributions',
    type: 'text',
    author: { name: 'David Miller', avatarUrl: AVATARS.david, profileUrl: '/user/david-miller' },
    title: 'Lessons Learned: Share Your Implementation Story',
    snippet:
      'Each partner municipality has unique experiences from the first phase. Share a short write-up of your key learnings, blockers, and breakthroughs so we can build a shared knowledge base.',
    timestamp: '1 week ago',
    tags: ['lessons-learned', 'phase-1', 'knowledge-sharing'],
    commentCount: 7,
  },
];

// ── Whiteboard contributions (for "Call for Ideas: Community Solar Projects") ─────

type WhiteboardContributionMock = {
  id: string;
  title: string;
  previewUrl: string;
  author: string;
};

export const MOCK_WHITEBOARD_CONTRIBUTIONS: WhiteboardContributionMock[] = [
  { id: 'wb-c1', title: 'Public Library Solar Roof', previewUrl: WB1, author: 'Sarah Chen' },
  { id: 'wb-c2', title: 'Parking Lot Canopies', previewUrl: WB2, author: 'David Miller' },
  { id: 'wb-c3', title: 'School Microgrids', previewUrl: WB3, author: 'Elena Rodriguez' },
  { id: 'wb-c4', title: 'Bus Stop Solar Stations', previewUrl: WB4, author: 'Marc Johnson' },
  { id: 'wb-c5', title: 'Town Hall Retrofit', previewUrl: WB1, author: 'John Smith' },
  { id: 'wb-c6', title: 'Park Lighting', previewUrl: WB2, author: 'Emily Davis' },
];

// ── Memo contributions (for the memo-contribution callout preview grid) ─────

type MemoContributionMock = {
  id: string;
  title: string;
  markdownContent: string;
  author: string;
};

export const MOCK_MEMO_CONTRIBUTIONS: MemoContributionMock[] = [
  {
    id: 'memo-c1',
    title: 'Amsterdam — District heating rollout',
    author: 'David Miller',
    markdownContent:
      '### Amsterdam district heating\n\nRolled out across 3 neighbourhoods in 2025. Key learnings:\n- Street-by-street phasing reduced disruption significantly\n- Resident co-design sessions were essential for buy-in\n- Grid capacity proved the biggest bottleneck',
  },
  {
    id: 'memo-c2',
    title: 'Utrecht — Community solar co-ops',
    author: 'Maya Ross',
    markdownContent:
      '### Utrecht solar co-ops\n\nTwo active co-ops with 840 households. **Governance note**: the rotating board model works well for decisions under €50k but struggles with strategic planning.',
  },
  {
    id: 'memo-c3',
    title: 'Rotterdam — Port electrification',
    author: 'Alex Contributor',
    markdownContent:
      '### Rotterdam port electrification\n\nPhase 1 shore power deployed at 6 berths. Phase 2 blocked by grid capacity. Working with TenneT on expedited reinforcement.',
  },
  {
    id: 'memo-c4',
    title: 'Groningen — Geothermal pilot',
    author: 'Elena Rodriguez',
    markdownContent:
      '### Groningen geothermal\n\nPilot well drilled to 2.1 km. Yields exceeded projections by ~18%. Next: connect to a 180-household district.',
  },
  {
    id: 'memo-c5',
    title: 'Eindhoven — Smart metering retrofit',
    author: 'Robert Fox',
    markdownContent:
      '### Eindhoven smart metering\n\nRetrofit completed for 12k meters across 2 districts. Real-time consumption data has surfaced several unexpected load patterns worth investigating.',
  },
  {
    id: 'memo-c6',
    title: 'The Hague — Municipal building audit',
    author: 'Sarah Chen',
    markdownContent:
      '### The Hague municipal audit\n\nEnergy audit of 42 public buildings revealed ~28% savings potential through envelope upgrades alone. Report attached as follow-up reference.',
  },
];

// ── Post contributions (for "Lessons Learned" post) ─────

type PostContributionMock = {
  id: string;
  title: string;
  author: { name: string; avatarUrl?: string };
  createdDate: string;
  description: string;
  tags?: string[];
  commentCount?: number;
};

export const MOCK_POST_CONTRIBUTIONS: PostContributionMock[] = [
  {
    id: 'post-c1',
    title: 'Amsterdam: Grid capacity was our biggest blocker',
    author: { name: 'David Miller', avatarUrl: AVATARS.david },
    createdDate: '3 days ago',
    description: 'We underestimated the grid reinforcement timeline by 8 months. The key lesson: engage TenneT in parallel with permitting, not sequentially.',
    tags: ['grid', 'amsterdam', 'timeline'],
    commentCount: 4,
  },
  {
    id: 'post-c2',
    title: 'Utrecht: Community ownership model accelerated adoption',
    author: { name: 'Maya Ross', avatarUrl: AVATARS.maya },
    createdDate: '4 days ago',
    description: 'When residents had equity stakes (even symbolic ones), approval ratings jumped from 45% to 82%. The co-op structure was essential.',
    tags: ['community', 'utrecht', 'governance'],
    commentCount: 6,
  },
  {
    id: 'post-c3',
    title: 'Rotterdam: Port electrification required political cover',
    author: { name: 'Alex Contributor', avatarUrl: AVATARS.alex },
    createdDate: '5 days ago',
    description: 'Industrial lobbying nearly killed Phase 1. Having the mayor publicly commit before the council vote was the turning point.',
    tags: ['politics', 'rotterdam', 'industrial'],
    commentCount: 2,
  },
  {
    id: 'post-c4',
    title: 'Eindhoven: Smart metering revealed hidden demand patterns',
    author: { name: 'Robert Fox', avatarUrl: AVATARS.robert },
    createdDate: '6 days ago',
    description: 'Real-time data from the first 5k meters showed peak demand 2 hours earlier than predicted. This shifted our entire storage sizing model.',
    tags: ['data', 'eindhoven', 'metering'],
    commentCount: 3,
  },
  {
    id: 'post-c5',
    title: 'Groningen: Geothermal is viable but slow to permit',
    author: { name: 'Elena Rodriguez', avatarUrl: AVATARS.elena },
    createdDate: '1 week ago',
    description: 'Despite excellent geological surveys, the permitting process took 14 months. Factor this into any geothermal timeline with a 50% contingency buffer.',
    tags: ['geothermal', 'groningen', 'permitting'],
    commentCount: 1,
  },
];

// ── Link/file contributions (for "Resource Pack" post) ──────

export const MOCK_LINK_CONTRIBUTIONS = [
  { id: 'link-c1', url: 'https://example.com/iec-61850-guide.pdf', displayName: 'IEC 61850 Communication Networks Guide', description: 'Full technical specification for substation automation', isFile: true, canEdit: true, canDelete: true },
  { id: 'link-c2', url: 'https://ec.europa.eu/energy/smart-grids', displayName: 'EU Smart Grid Reference Architecture', description: 'Official EU reference for interoperability', isFile: false, canEdit: true, canDelete: true },
  { id: 'link-c3', url: 'https://example.com/grid-tool-v2.4.xlsx', displayName: 'Grid Capacity Assessment Tool (v2.4)', isFile: true, canEdit: true, canDelete: true },
  { id: 'link-c4', url: 'https://tennet.eu/connection-requirements-2026', displayName: 'TenneT Connection Requirements 2026', description: 'Updated requirements for grid connection applications', isFile: false, canEdit: true, canDelete: true },
  { id: 'link-c5', url: 'https://example.com/battery-storage-whitepaper.pdf', displayName: 'Battery Storage Integration Whitepaper', description: 'Research paper on optimal battery sizing for municipal grids', isFile: true, canEdit: false, canDelete: false },
  { id: 'link-c6', url: 'https://example.com/ev-charging-network-plan.pdf', displayName: 'EV Charging Network Rollout Plan', isFile: true, canEdit: true, canDelete: true },
  { id: 'link-c7', url: 'https://smartgrid.ieee.org/standards', displayName: 'IEEE Smart Grid Standards Portal', isFile: false, canEdit: false, canDelete: false },
  { id: 'link-c8', url: 'https://example.com/demand-response-model.xlsx', displayName: 'Demand Response Simulation Model', description: 'Excel model for simulating load-shifting scenarios', isFile: true, canEdit: true, canDelete: true },
  { id: 'link-c9', url: 'https://example.com/metering-api-docs', displayName: 'Smart Metering API Documentation', description: 'REST API documentation for meter data integration', isFile: false, canEdit: true, canDelete: true },
];

// ── Members ──────────────────────────────────────────

const memberNames = [
  'Elena Martinez',
  'Sarah Chen',
  'Maya Ross',
  'David Kim',
  'Robert Fox',
  'James Wilson',
  'Emma Thompson',
  'Lucas Oliveira',
  'Sophia Li',
  'Oliver Smith',
  'Ava Patel',
  'William Chen',
  'Isabella Garcia',
  'Henry Wilson',
  'Mia Kim',
];

export const MOCK_MEMBERS: MemberCardData[] = memberNames.map((name, i) => ({
  id: `m${i}`,
  name,
  avatarUrl: i < 6 ? Object.values(AVATARS)[i] : undefined,
  type: 'user',
  location: ['Amsterdam, NL', 'San Francisco, US', 'Berlin, DE', 'Tokyo, JP', 'London, UK'][i % 5],
  tagline: ['Community Host', 'Sustainability Researcher', 'Energy Policy Expert', 'Urban Planner', 'Data Scientist'][
    i % 5
  ],
  tags: [
    ['sustainability', 'policy'],
    ['energy', 'research'],
    ['urban', 'planning'],
    ['data', 'analytics'],
    ['community'],
  ][i % 5],
  href: `/user/${name.toLowerCase().replace(/\s+/g, '-')}`,
}));

export const MOCK_ORGANIZATIONS: MemberCardData[] = [
  {
    id: 'o1',
    name: 'Green Future Labs',
    avatarUrl: undefined,
    type: 'organization',
    location: 'Amsterdam, NL',
    tagline: 'Research Institute for Sustainable Innovation',
    tags: ['research', 'sustainability'],
    href: '/org/green-future-labs',
  },
  {
    id: 'o2',
    name: 'City of Amsterdam',
    avatarUrl: undefined,
    type: 'organization',
    location: 'Amsterdam, NL',
    tagline: 'Municipality',
    tags: ['government', 'urban'],
    href: '/org/city-of-amsterdam',
  },
  {
    id: 'o3',
    name: 'Utrecht University',
    avatarUrl: undefined,
    type: 'organization',
    location: 'Utrecht, NL',
    tagline: 'Academic Partner',
    tags: ['academic', 'research'],
    href: '/org/utrecht-university',
  },
  {
    id: 'o4',
    name: 'Sustainable Cities Fund',
    avatarUrl: undefined,
    type: 'organization',
    location: 'Brussels, BE',
    tagline: 'NGO',
    tags: ['funding', 'sustainability'],
    href: '/org/sustainable-cities-fund',
  },
];

// ── Subspaces ────────────────────────────────────────

const SUBSPACE_BANNERS = [
  'https://images.unsplash.com/photo-1677506048377-1099738d294d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1743385779313-ac03bb0f997b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1760611656007-f767a8082758?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1769069918751-9cdb7c752fcc?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1554103210-26d928978fb5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1683818051102-dd1199d163b9?auto=format&fit=crop&w=800&q=80',
];

export const MOCK_SUBSPACES: SpaceCardData[] = [
  {
    id: 'sub-1',
    name: 'Renewable Energy Transition',
    description: 'Strategy and policy for 100% renewable energy by 2030',
    bannerImageUrl: SUBSPACE_BANNERS[0],
    initials: 'RE',
    avatarColor: '#2563eb',
    tags: ['energy', 'policy', 'strategy'],
    isPrivate: false,
    isMember: true,
    leads: [{ name: 'Sarah Chen', avatarUrl: AVATARS.sarah, type: 'person' }],
    href: '/space/green-energy/challenges/renewable-energy',
  },
  {
    id: 'sub-2',
    name: 'Urban Mobility Lab',
    description: 'Sustainable transport and smart mobility solutions',
    bannerImageUrl: SUBSPACE_BANNERS[1],
    initials: 'UM',
    avatarColor: '#7c3aed',
    tags: ['mobility', 'transport', 'smart-city'],
    isPrivate: false,
    isMember: true,
    leads: [{ name: 'David Kim', avatarUrl: AVATARS.david, type: 'person' }],
    href: '/space/green-energy/challenges/urban-mobility',
  },
  {
    id: 'sub-3',
    name: 'Green Infrastructure',
    description: 'Nature-based solutions for urban resilience',
    bannerImageUrl: SUBSPACE_BANNERS[2],
    initials: 'GI',
    avatarColor: '#059669',
    tags: ['infrastructure', 'nature', 'resilience'],
    isPrivate: false,
    isMember: false,
    leads: [{ name: 'Emily Davis', avatarUrl: '', type: 'person' }],
    href: '/space/green-energy/challenges/green-infrastructure',
  },
  {
    id: 'sub-4',
    name: 'Policy Frameworks',
    description: 'Regulatory and compliance frameworks',
    bannerImageUrl: SUBSPACE_BANNERS[3],
    initials: 'PF',
    avatarColor: '#d97706',
    tags: ['policy', 'regulation', 'compliance'],
    isPrivate: true,
    isMember: false,
    leads: [{ name: 'Policy Institute', avatarUrl: '', type: 'org' }],
    href: '/space/green-energy/challenges/policy-frameworks',
  },
  {
    id: 'sub-5',
    name: 'Community Engagement',
    description: 'Citizen participation and stakeholder dialogue',
    bannerImageUrl: SUBSPACE_BANNERS[4],
    initials: 'CE',
    avatarColor: '#dc2626',
    tags: ['community', 'engagement', 'participation'],
    isPrivate: false,
    isMember: true,
    isPinned: true,
    leads: [{ name: 'Anna Martinez', avatarUrl: AVATARS.maya, type: 'person' }],
    href: '/space/green-energy/challenges/community-engagement',
  },
  {
    id: 'sub-6',
    name: 'Digital Twin Project',
    description: 'Digital modelling of urban energy systems',
    bannerImageUrl: SUBSPACE_BANNERS[5],
    initials: 'DT',
    avatarColor: '#0891b2',
    tags: ['digital', 'modelling', 'technology'],
    isPrivate: false,
    isMember: false,
    leads: [{ name: 'Robert Fox', avatarUrl: AVATARS.robert, type: 'person' }],
    href: '/space/green-energy/challenges/digital-twin',
  },
];

export const MOCK_COMMENTS: CommentData[] = [
  {
    id: 'c1',
    author: { id: 'u1', name: 'Sarah Chen', avatarUrl: AVATARS.sarah },
    content: 'Great kickoff. I can help with policy review and timeline planning.',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    timestampMs: Date.now() - 1000 * 60 * 90,
    reactions: [
      {
        emoji: '👍',
        count: 3,
        hasReacted: true,
        senders: [
          { id: 'u2', name: 'David Miller' },
          { id: 'u3', name: 'Elena Rodriguez' },
          { id: 'u1', name: 'Sarah Chen' },
        ],
      },
      {
        emoji: '🚀',
        count: 1,
        hasReacted: false,
        senders: [{ id: 'u4', name: 'Alex Contributor' }],
      },
    ],
    canDelete: true,
  },
  {
    id: 'c2',
    author: { id: 'u2', name: 'David Miller', avatarUrl: AVATARS.david },
    content: 'Agreed. We should prioritize municipal buildings first.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    timestampMs: Date.now() - 1000 * 60 * 45,
    parentId: 'c1',
    reactions: [],
    canDelete: false,
  },
  {
    id: 'c3',
    author: { id: 'deleted', name: 'Deleted user' },
    content: '',
    timestamp: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    timestampMs: Date.now() - 1000 * 60 * 70,
    reactions: [],
    isDeleted: true,
    canDelete: false,
  },
  {
    id: 'c4',
    author: { id: 'u5', name: 'Maya Ross', avatarUrl: AVATARS.maya },
    content: 'I can contribute data on current consumption patterns.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    timestampMs: Date.now() - 1000 * 60 * 30,
    parentId: 'c3',
    reactions: [
      {
        emoji: '👏',
        count: 2,
        hasReacted: false,
        senders: [
          { id: 'u1', name: 'Sarah Chen' },
          { id: 'u2', name: 'David Miller' },
        ],
      },
    ],
    canDelete: false,
  },
];

// ── Callout Detail Dialog Mock ──────────────────────

export const MOCK_CALLOUT_DIALOG: CalloutDetailDialogData = {
  id: 'callout-1',
  title: 'Community Solar Installation Project — Phase 2 Planning',
  author: {
    name: 'Sarah Chen',
    avatarUrl: AVATARS.sarah,
    profileUrl: '/user/sarah-chen',
  },
  description:
    'We are entering Phase 2 of our community solar installation project. This phase focuses on site selection, permitting, and community engagement. Please review the updated timeline and share your feedback on the proposed locations.\n\nKey milestones:\n- Site assessment completion by end of Q2\n- Permitting applications submitted by July\n- Community workshops scheduled for August',
  timestamp: '2 days ago',
  commentCount: 4,
  reactionCount: 7,
  tags: ['solar', 'phase-2', 'community-engagement', 'permitting'],
  references: [
    { id: 'ref-dialog-1', name: 'Phase 1 Report', uri: 'https://example.com/phase-1-report.pdf', isFile: true },
    { id: 'ref-dialog-2', name: 'Site Selection Criteria', uri: 'https://example.com/site-criteria' },
  ],
};

// ── Sidebar ──────────────────────────────────────────

export const MOCK_SIDEBAR = {
  description:
    'Collaborating on the future of sustainable energy solutions and urban transformation. Join our community of innovators working to solve real-world challenges.',
  subspaces: [
    {
      name: 'Renewable Energy',
      initials: 'RE',
      href: '/space/green-energy/challenges/renewable-energy',
      avatarUrl: SUBSPACE_BANNERS[0],
    },
    {
      name: 'Urban Planning',
      initials: 'UP',
      href: '/space/green-energy/challenges/urban-planning',
      avatarUrl: SUBSPACE_BANNERS[1],
    },
    {
      // No avatarUrl — demonstrates the retained grey initials fallback.
      name: 'Transportation',
      initials: 'TR',
      href: '/space/green-energy/challenges/transportation',
    },
  ],
  leads: [
    {
      id: 'lead-1',
      name: 'Elena Martinez',
      avatarUrl:
        'https://images.unsplash.com/photo-1623853589874-864b1dd4d922?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      initials: 'EM',
      location: 'Amsterdam, NL',
      href: '/user/elena-martinez',
      type: 'person' as const,
    },
    {
      id: 'lead-2',
      name: 'Green Future Labs',
      avatarUrl: undefined,
      initials: 'GF',
      location: 'Amsterdam, NL',
      href: '/org/green-future-labs',
      type: 'org' as const,
    },
  ],
  guidelines: [
    'Be respectful and constructive in all discussions.',
    'Share knowledge openly and credit original sources.',
    'Stay on topic within each subspace and thread.',
    'Protect the privacy of community members.',
  ],
  virtualContributors: [
    {
      name: 'Sustainability Advisor',
      description: 'AI assistant trained on sustainability frameworks and best practices.',
      avatarUrl: undefined,
      initials: 'SA',
    },
    {
      name: 'Policy Researcher',
      description: 'Specialises in regulatory and policy analysis for urban environments.',
      avatarUrl: undefined,
      initials: 'PR',
    },
  ],
};
