import type { CalloutDetailDialogData } from '@/crd/components/callout/CalloutDetailDialog';
import type { PostCardData } from '@/crd/components/space/PostCard';
import type { SpaceCardData } from '@/crd/components/space/SpaceCard';
import type { MemberCardData } from '@/crd/components/space/SpaceMembers';
import type { CommentData } from '@/crd/components/comment/types';

// ── Avatars ──────────────────────────────────────────

const AVATARS = {
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
    author: { name: 'Sarah Chen', avatarUrl: AVATARS.sarah, role: 'Lead' },
    title: 'Kickoff: Municipal Transition Strategy',
    snippet:
      'We are officially launching the strategy phase for the 2030 renewable transition. Our goal is to outline a clear path for municipalities to reach 100% renewable energy. Please review the initial policy draft.',
    timestamp: '2 hours ago',
    commentCount: 5,
  },
  {
    id: 'p2',
    type: 'text',
    author: { name: 'Alex Contributor', avatarUrl: AVATARS.alex, role: 'Member' },
    title: 'Call for Ideas: Community Solar Projects',
    snippet:
      'We need innovative concepts for integrating solar into existing municipal infrastructure. Please sketch out your ideas for public buildings, parking lots, and open spaces.',
    timestamp: '3 hours ago',
    commentCount: 8,
  },
  {
    id: 'p3',
    type: 'whiteboard',
    author: { name: 'David Miller', avatarUrl: AVATARS.david, role: 'Member' },
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
    author: { name: 'Elena Rodriguez', avatarUrl: AVATARS.elena, role: 'Lead' },
    title: 'Q2 Strategy Review — Collaborative Memo',
    snippet:
      'A shared memo capturing decisions and open questions from our Q2 strategy session. Click to open the collaborative editor.',
    timestamp: '6 hours ago',
    framingMemoMarkdown: MEMO_FRAMING_MARKDOWN,
    commentCount: 4,
  },
  {
    id: 'p-memo-contribs',
    type: 'text',
    author: { name: 'Sarah Chen', avatarUrl: AVATARS.sarah, role: 'Lead' },
    title: 'Share your municipal case study (memo contributions)',
    snippet:
      'We are collecting short memos from each partner municipality describing local constraints, wins, and lessons. Add your memo below or open an existing one to co-edit.',
    timestamp: '8 hours ago',
    commentCount: 9,
  },
  {
    id: 'p4',
    type: 'text',
    author: { name: 'Elena Rodriguez', avatarUrl: AVATARS.elena, role: 'Lead' },
    title: 'Transition Case Studies & Policy Docs',
    snippet:
      'A collection of successful case studies from similar sized municipalities reaching 100% renewables. Essential reading for the strategy team.',
    timestamp: '1 day ago',
    commentCount: 12,
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
    parentId: 'c1',
    reactions: [],
    canDelete: false,
  },
  {
    id: 'c3',
    author: { id: 'deleted', name: 'Deleted user' },
    content: '',
    timestamp: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    reactions: [],
    isDeleted: true,
    canDelete: false,
  },
  {
    id: 'c4',
    author: { id: 'u5', name: 'Maya Ross', avatarUrl: AVATARS.maya },
    content: 'I can contribute data on current consumption patterns.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
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
    role: 'Space Lead',
  },
  description:
    'We are entering Phase 2 of our community solar installation project. This phase focuses on site selection, permitting, and community engagement. Please review the updated timeline and share your feedback on the proposed locations.\n\nKey milestones:\n- Site assessment completion by end of Q2\n- Permitting applications submitted by July\n- Community workshops scheduled for August',
  timestamp: '2 days ago',
  commentCount: 4,
  reactionCount: 7,
};

// ── Sidebar ──────────────────────────────────────────

export const MOCK_SIDEBAR = {
  description:
    'Collaborating on the future of sustainable energy solutions and urban transformation. Join our community of innovators working to solve real-world challenges.',
  subspaces: [
    {
      name: 'Renewable Energy',
      initials: 'RE',
      color: 'var(--chart-1)',
      href: '/space/green-energy/challenges/renewable-energy',
    },
    {
      name: 'Urban Planning',
      initials: 'UP',
      color: 'var(--chart-2)',
      href: '/space/green-energy/challenges/urban-planning',
    },
    {
      name: 'Transportation',
      initials: 'TR',
      color: 'var(--chart-3)',
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
  knowledgeEntries: [
    { id: 'kb-1', title: 'Transition Case Studies & Policy Docs', type: 'collection' as const },
    { id: 'kb-2', title: 'Q1 Sustainability Report & Supporting Data', type: 'collection' as const },
    { id: 'kb-3', title: 'Community Workshop Guidelines', type: 'text' as const },
    { id: 'kb-4', title: 'Grid Modernisation Reference Materials', type: 'collection' as const },
    { id: 'kb-5', title: 'Funding Opportunities for Municipal Energy Projects', type: 'text' as const },
  ],
};
