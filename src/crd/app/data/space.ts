import type { PostCardData } from '@/crd/components/space/PostCard';
import type { MemberCardData } from '@/crd/components/space/SpaceMembers';
import type { SubspaceListCardData } from '@/crd/components/space/SpaceSubspacesList';

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
const WB4 = 'https://images.unsplash.com/photo-1596496050844-3613acf57a8e?auto=format&fit=crop&q=80&w=1080';

// ── Space Header ─────────────────────────────────────

export const MOCK_SPACE_BANNER = {
  title: 'Green Energy Space',
  tagline: 'Collaborating on the future of sustainable energy solutions and urban transformation.',
  bannerUrl: BANNER_URL,
  isHomeSpace: false,
  memberAvatars: [
    { url: AVATARS.sarah, initials: 'SC' },
    { url: AVATARS.david, initials: 'DM' },
    { url: AVATARS.elena, initials: 'ER' },
    { url: AVATARS.alex, initials: 'AC' },
    { url: AVATARS.maya, initials: 'MR' },
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
    type: 'call-for-whiteboards',
    author: { name: 'Alex Contributor', avatarUrl: AVATARS.alex, role: 'Member' },
    title: 'Call for Ideas: Community Solar Projects',
    snippet:
      'We need innovative concepts for integrating solar into existing municipal infrastructure. Please sketch out your ideas for public buildings, parking lots, and open spaces.',
    timestamp: '3 hours ago',
    contentPreview: {
      whiteboards: [
        { title: 'Public Library Solar Roof', imageUrl: WB1, author: 'Sarah Chen' },
        { title: 'Parking Lot Canopies', imageUrl: WB2, author: 'David Miller' },
        { title: 'School Microgrids', imageUrl: WB3, author: 'Elena Rodriguez' },
        { title: 'Bus Stop Solar Stations', imageUrl: WB4, author: 'Marc Johnson' },
        { title: 'Town Hall Retrofit', imageUrl: WB1, author: 'John Smith' },
        { title: 'Park Lighting', imageUrl: WB2, author: 'Emily Davis' },
      ],
    },
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
    contentPreview: { imageUrl: WB3 },
    commentCount: 3,
  },
  {
    id: 'p4',
    type: 'collection',
    author: { name: 'Elena Rodriguez', avatarUrl: AVATARS.elena, role: 'Lead' },
    title: 'Transition Case Studies & Policy Docs',
    snippet:
      'A collection of successful case studies from similar sized municipalities reaching 100% renewables. Essential reading for the strategy team.',
    timestamp: '1 day ago',
    contentPreview: {
      items: [
        { title: 'Burlington, VT Case Study', type: 'pdf' },
        { title: 'Aspen, CO Transition Plan', type: 'pdf' },
        { title: 'Grid Integration Analysis', type: 'doc' },
        { title: '2030 Policy Framework', type: 'pdf' },
      ],
    },
    commentCount: 12,
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

export const MOCK_SUBSPACES: SubspaceListCardData[] = [
  {
    id: 'sub-1',
    name: 'Renewable Energy Transition',
    tagline: 'Strategy and policy for 100% renewable energy by 2030',
    bannerUrl: SUBSPACE_BANNERS[0],
    tags: ['energy', 'policy', 'strategy'],
    isPrivate: false,
    isMember: true,
    isPinned: false,
    leads: [{ name: 'Sarah Chen', avatarUrl: AVATARS.sarah }],
    href: '/space/green-energy/challenges/renewable-energy',
  },
  {
    id: 'sub-2',
    name: 'Urban Mobility Lab',
    tagline: 'Sustainable transport and smart mobility solutions',
    bannerUrl: SUBSPACE_BANNERS[1],
    tags: ['mobility', 'transport', 'smart-city'],
    isPrivate: false,
    isMember: true,
    isPinned: false,
    leads: [{ name: 'David Kim', avatarUrl: AVATARS.david }],
    href: '/space/green-energy/challenges/urban-mobility',
  },
  {
    id: 'sub-3',
    name: 'Green Infrastructure',
    tagline: 'Nature-based solutions for urban resilience',
    bannerUrl: SUBSPACE_BANNERS[2],
    tags: ['infrastructure', 'nature', 'resilience'],
    isPrivate: false,
    isMember: false,
    isPinned: false,
    leads: [{ name: 'Emily Davis' }],
    href: '/space/green-energy/challenges/green-infrastructure',
  },
  {
    id: 'sub-4',
    name: 'Policy Frameworks',
    tagline: 'Regulatory and compliance frameworks',
    bannerUrl: SUBSPACE_BANNERS[3],
    tags: ['policy', 'regulation', 'compliance'],
    isPrivate: true,
    isMember: false,
    isPinned: false,
    leads: [{ name: 'Policy Institute' }],
    href: '/space/green-energy/challenges/policy-frameworks',
  },
  {
    id: 'sub-5',
    name: 'Community Engagement',
    tagline: 'Citizen participation and stakeholder dialogue',
    bannerUrl: SUBSPACE_BANNERS[4],
    tags: ['community', 'engagement', 'participation'],
    isPrivate: false,
    isMember: true,
    isPinned: true,
    leads: [{ name: 'Anna Martinez', avatarUrl: AVATARS.maya }],
    href: '/space/green-energy/challenges/community-engagement',
  },
  {
    id: 'sub-6',
    name: 'Digital Twin Project',
    tagline: 'Digital modelling of urban energy systems',
    bannerUrl: SUBSPACE_BANNERS[5],
    tags: ['digital', 'modelling', 'technology'],
    isPrivate: false,
    isMember: false,
    isPinned: false,
    leads: [{ name: 'Robert Fox', avatarUrl: AVATARS.robert }],
    href: '/space/green-energy/challenges/digital-twin',
  },
];

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
  lead: {
    name: 'Elena Martinez',
    avatarUrl:
      'https://images.unsplash.com/photo-1623853589874-864b1dd4d922?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    initials: 'EM',
    location: 'Amsterdam, NL',
    bio: 'Community Host. Driving sustainable innovation in urban planning.',
  },
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
