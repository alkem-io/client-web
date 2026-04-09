import { pickColorFromId } from '@/crd/lib/pickColorFromId';

// Path helpers for default space visuals (copied from public/default-visuals/)
// 'custom' represents a space whose owner uploaded their own image
const CUSTOM_AVATAR =
  'https://images.unsplash.com/photo-1623652554515-91c833e3080e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=150';
const CUSTOM_CARD =
  'https://images.unsplash.com/photo-1623652554515-91c833e3080e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
const spaceAvatar = (hex: string) =>
  hex === 'custom' ? CUSTOM_AVATAR : `/default-visuals/space/avatar/alkemio-default-avatar-${hex}.jpg`;
const spaceCard = (hex: string) =>
  hex === 'custom' ? CUSTOM_CARD : `/default-visuals/space/card/alkemio-default-card-${hex}.jpg`;

export const MOCK_RECENT_SPACES = [
  {
    id: 'rs-1',
    name: 'Innovation Lab',
    href: '/space/innovation-lab',
    bannerUrl: spaceCard('custom'),
    isPrivate: true,
    isHomeSpace: true,
    initials: 'IL',
    color: pickColorFromId('rs-1'),
  },
  {
    id: 'rs-2',
    name: 'Design Workshop',
    href: '/space/design-workshop',
    bannerUrl: spaceCard('1'),
    isPrivate: false,
    isHomeSpace: false,
    initials: 'DW',
    color: pickColorFromId('rs-2'),
  },
  {
    id: 'rs-3',
    name: 'Team Sync',
    href: '/space/team-sync',
    bannerUrl: spaceCard('2'),
    isPrivate: true,
    isHomeSpace: false,
    initials: 'TS',
    color: pickColorFromId('rs-3'),
  },
  {
    id: 'rs-4',
    name: 'Future Strategy',
    href: '/space/future-strategy',
    bannerUrl: spaceCard('3'),
    isPrivate: false,
    isHomeSpace: false,
    initials: 'FS',
    color: pickColorFromId('rs-4'),
  },
];

export const MOCK_SPACE_ACTIVITIES = [
  {
    id: 'sa-1',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64',
    avatarInitials: 'SC',
    userName: 'Sarah Chen',
    actionText: 'posted a new challenge in',
    targetName: 'Innovation Lab',
    targetHref: '/space/innovation-lab',
    timestamp: '2 hours ago',
  },
  {
    id: 'sa-2',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=64&h=64',
    avatarInitials: 'MR',
    userName: 'Mike Ross',
    actionText: 'commented on',
    targetName: 'Design Review',
    targetHref: '/space/design-workshop',
    timestamp: '4 hours ago',
  },
  {
    id: 'sa-3',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=64&h=64',
    avatarInitials: 'AS',
    userName: 'Anna Smith',
    actionText: 'shared a file in',
    targetName: 'Marketing Strategy',
    targetHref: '/space/marketing',
    timestamp: 'Yesterday',
  },
  {
    id: 'sa-4',
    avatarUrl:
      'https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMG1hbnxlbnwxfHx8fDE3Njk0Nzg0NTZ8MA&ixlib=rb-4.1.0&q=80&w=64&h=64',
    avatarInitials: 'DK',
    userName: 'David Kim',
    actionText: 'updated the description of',
    targetName: 'Product Roadmap',
    targetHref: '/space/product',
    timestamp: 'Yesterday',
  },
  {
    id: 'sa-5',
    avatarUrl:
      'https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHdvbWFufGVufDF8fHx8MTc2OTQ3ODMzMnww&ixlib=rb-4.1.0&q=80&w=64&h=64',
    avatarInitials: 'ER',
    userName: 'Elena Rodriguez',
    actionText: 'added 5 new members to',
    targetName: 'Community Hub',
    targetHref: '/space/community',
    timestamp: '2 days ago',
  },
  {
    id: 'sa-6',
    avatarUrl:
      'https://images.unsplash.com/photo-1603143704710-99d6011f107e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXIlMjBoZWFkc2hvdHxlbnwxfHx8fDE3Njk1MzI5NjB8MA&ixlib=rb-4.1.0&q=80&w=64&h=64',
    avatarInitials: 'JW',
    userName: 'James Wilson',
    actionText: 'archived',
    targetName: 'Q3 Goals',
    timestamp: '3 days ago',
  },
  {
    id: 'sa-7',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64',
    avatarInitials: 'SC',
    userName: 'Sarah Chen',
    actionText: 'scheduled a meeting in',
    targetName: 'Innovation Lab',
    targetHref: '/space/innovation-lab',
    timestamp: '3 days ago',
  },
];

const PERSONAL_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=64&h=64';

export const MOCK_PERSONAL_ACTIVITIES = [
  {
    id: 'pa-1',
    avatarUrl: PERSONAL_AVATAR,
    avatarInitials: 'AR',
    userName: 'You',
    actionText: 'created a new space',
    targetName: 'Project Alpha',
    targetHref: '/space/project-alpha',
    timestamp: '1 day ago',
  },
  {
    id: 'pa-2',
    avatarUrl: PERSONAL_AVATAR,
    avatarInitials: 'AR',
    userName: 'You',
    actionText: 'invited 3 members to',
    targetName: 'Team Sync',
    targetHref: '/space/team-sync',
    timestamp: '2 days ago',
  },
  {
    id: 'pa-3',
    avatarUrl: PERSONAL_AVATAR,
    avatarInitials: 'AR',
    userName: 'You',
    actionText: 'joined',
    targetName: 'Data Science Team',
    targetHref: '/space/data-science',
    timestamp: '3 days ago',
  },
  {
    id: 'pa-4',
    avatarUrl: PERSONAL_AVATAR,
    avatarInitials: 'AR',
    userName: 'You',
    actionText: 'replied to a comment in',
    targetName: 'Design Review',
    targetHref: '/space/design-workshop',
    timestamp: '4 days ago',
  },
  {
    id: 'pa-5',
    avatarUrl: PERSONAL_AVATAR,
    avatarInitials: 'AR',
    userName: 'You',
    actionText: 'downloaded a report from',
    targetName: 'Analytics Dashboard',
    targetHref: '/space/analytics',
    timestamp: '1 week ago',
  },
  {
    id: 'pa-6',
    avatarUrl: PERSONAL_AVATAR,
    avatarInitials: 'AR',
    userName: 'You',
    actionText: 'updated your settings',
    targetName: 'Profile',
    timestamp: '1 week ago',
  },
];

export const MOCK_SIDEBAR_MENU_ITEMS = [
  { id: 'inv', label: 'Invitations', iconName: 'Mail', badgeCount: 2 },
  { id: 'create', label: 'Create my own Space', iconName: 'Rocket', href: '#' },
  { id: 'tips', label: 'Tips & Tricks', iconName: 'Lightbulb' },
  { id: 'account', label: 'My Account', iconName: 'Tag', href: '/user/alex-rivera/settings/account' },
];

export const MOCK_SIDEBAR_RESOURCE_SECTIONS = [
  {
    title: 'My Spaces',
    items: [
      { id: 'sp-1', name: 'Green Energy Space', href: '/space/green-energy', initials: 'GE' },
      { id: 'sp-2', name: 'Community Garden', href: '/space/community-garden', initials: 'CG' },
      { id: 'sp-3', name: 'Digital Transformation', href: '/space/digital-trans', initials: 'DT' },
    ],
  },
  {
    title: 'Virtual Contributors',
    items: [
      { id: 'vc-1', name: 'Softmann', href: '#', initials: 'SM', avatarColor: 'var(--chart-2)' },
      {
        id: 'vc-2',
        name: 'The Collaboration Methodologist',
        href: '#',
        initials: 'CM',
        avatarColor: 'var(--chart-2)',
      },
    ],
  },
];

export const MOCK_INVITATIONS = [
  {
    id: 'inv-1',
    spaceId: 's-sustainability',
    spaceName: 'Sustainability Goals 2024',
    spaceHref: '/space/sustainability-goals',
    spaceAvatarUrl: spaceAvatar('4'),
    role: 'Editor',
    color: pickColorFromId('s-sustainability'),
  },
  {
    id: 'inv-2',
    spaceId: 's-urban-mobility',
    spaceName: 'Urban Mobility Lab',
    spaceHref: '/space/urban-mobility',
    spaceAvatarUrl: spaceAvatar('5'),
    role: 'Viewer',
    color: pickColorFromId('s-urban-mobility'),
  },
  {
    id: 'inv-3',
    spaceId: 's-financial',
    spaceName: 'Q1 Financial Planning',
    spaceHref: '/space/financial-planning',
    spaceAvatarUrl: spaceAvatar('6'),
    role: 'Admin',
    color: pickColorFromId('s-financial'),
  },
];

// ─── Pending Memberships Dialog Mock Data ───────────────────────────────────

export const MOCK_PENDING_INVITATIONS = [
  {
    id: 'pi-1',
    spaceName: 'Sustainability Goals 2024',
    spaceAvatarUrl: spaceAvatar('4'),
    senderName: 'Sarah Chen',
    welcomeMessageExcerpt: 'We would love to have you join our sustainability initiative. Your expertise in...',
    timeElapsed: '2 hours ago',
    color: pickColorFromId('pi-1'),
  },
  {
    id: 'pi-2',
    spaceName: 'Urban Mobility Lab',
    spaceAvatarUrl: spaceAvatar('5'),
    senderName: 'Marc Johnson',
    welcomeMessageExcerpt: 'Join us to explore innovative urban transport solutions together!',
    timeElapsed: '1 day ago',
    color: pickColorFromId('pi-2'),
  },
];

export const MOCK_PENDING_VC_INVITATIONS = [
  {
    id: 'pv-1',
    spaceName: 'AI Research Collective',
    senderName: 'Platform Admin',
    welcomeMessageExcerpt: 'Your virtual contributor "DataBot" has been invited to participate in...',
    timeElapsed: '3 hours ago',
    color: pickColorFromId('pv-1'),
  },
];

export const MOCK_PENDING_APPLICATIONS = [
  {
    id: 'pa-app-1',
    spaceName: 'Q1 Financial Planning',
    spaceAvatarUrl: spaceAvatar('6'),
    tagline: 'Collaborative quarterly financial planning and budgeting',
    spaceHref: '/space/financial-planning',
    color: pickColorFromId('pa-app-1'),
  },
];

export const MOCK_INVITATION_DETAIL = {
  spaceName: 'Sustainability Goals 2024',
  spaceAvatarUrl: spaceAvatar('4'),
  spaceTagline: 'Working together towards a sustainable future for all communities',
  spaceTags: ['Sustainability', 'Climate', 'Innovation', 'Community'],
  spaceHref: '/space/sustainability-goals',
  senderName: 'Sarah Chen',
  timeElapsed: '2 hours ago',
  color: pickColorFromId('s-sustainability-detail'),
};

// ─── Notifications Mock Data ──────────────────────────────────────────────────

export const MOCK_NOTIFICATION_ITEMS = [
  {
    id: 'n-1',
    title: 'Sarah Chen commented on your post in Innovation Lab',
    description: "Great insights! I think we should explore this direction further in next week's session.",
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64',
    avatarFallback: 'SC',
    timestamp: '5 min ago',
    isUnread: true,
    href: '/space/innovation-lab',
  },
  {
    id: 'n-2',
    title: 'You were added as Editor to Sustainability Goals 2024',
    description: 'Sarah Chen invited you to join the space.',
    avatarUrl: 'https://images.unsplash.com/photo-1623652554515-91c833e3080e?auto=format&fit=crop&w=64&h=64',
    avatarFallback: 'SG',
    timestamp: '2 hours ago',
    isUnread: true,
    href: '/space/sustainability-goals',
  },
  {
    id: 'n-3',
    title: 'Mike Ross replied to your comment in Design Review',
    description: 'I agree with the proposed changes. Let me update the mockups accordingly.',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=64&h=64',
    avatarFallback: 'MR',
    timestamp: '4 hours ago',
    isUnread: false,
    href: '/space/design-workshop',
  },
  {
    id: 'n-4',
    title: 'New challenge posted in Community Hub',
    description: 'Elena Rodriguez posted "Q2 Community Engagement Plan" — looking for contributors.',
    avatarUrl: 'https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?auto=format&fit=crop&w=64&h=64',
    avatarFallback: 'ER',
    timestamp: 'Yesterday',
    isUnread: false,
    href: '/space/community',
  },
  {
    id: 'n-5',
    title: 'Platform update: New collaboration features',
    description: "We've launched real-time co-editing for whiteboards. Try it out in any space!",
    avatarFallback: 'AL',
    timestamp: '2 days ago',
    isUnread: false,
  },
  {
    id: 'n-6',
    title: 'David Kim shared a file in Product Roadmap',
    description: 'Q2-roadmap-v3.pdf has been uploaded to the shared resources.',
    avatarUrl: 'https://images.unsplash.com/photo-1672685667592-0392f458f46f?auto=format&fit=crop&w=64&h=64',
    avatarFallback: 'DK',
    timestamp: '3 days ago',
    isUnread: false,
    href: '/space/product',
  },
];

export const MOCK_NOTIFICATION_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'messages', label: 'Messages & Replies' },
  { key: 'space', label: 'Space' },
  { key: 'platform', label: 'Platform' },
];

// ─── Memberships Panel Mock Data ──────────────────────────────────────────────

import type { MembershipItem } from '@/crd/components/dashboard/MyMembershipsPanel';

export const MOCK_MEMBERSHIPS_PANEL: MembershipItem[] = [
  // ── Green Energy Space ──
  {
    id: 'mp-1',
    name: 'Green Energy Space',
    href: '/space/green-energy',
    tagline: 'Accelerating the transition to clean, renewable energy sources',
    isPrivate: false,
    roles: ['admin', 'lead'],
    initials: 'GE',
    color: '#4caf50',
    image: spaceCard('0'),
    children: [
      {
        id: 'mp-1-1',
        name: 'Renewable Energy Transition',
        href: '/space/green-energy/renewable-transition',
        isPrivate: false,
        roles: ['member'],
        initials: 'RE',
        color: '#66bb6a',
        image: spaceAvatar('a'),
        children: [
          {
            id: 'mp-1-1-1',
            name: 'Wind Energy Task Force',
            href: '/space/green-energy/renewable-transition/wind-energy',
            isPrivate: false,
            roles: ['lead'],
            initials: 'WE',
            color: '#81c784',
            image: spaceAvatar('f'),
          },
          {
            id: 'mp-1-1-2',
            name: 'Hydro Power Research',
            href: '/space/green-energy/renewable-transition/hydro-power',
            isPrivate: true,
            roles: ['member'],
            initials: 'HP',
            color: '#4dd0e1',
            image: spaceAvatar('0'),
          },
        ],
      },
      {
        id: 'mp-1-2',
        name: 'Solar Panel Innovation',
        href: '/space/green-energy/solar-panels',
        isPrivate: true,
        roles: ['admin'],
        initials: 'SP',
        color: '#ffa726',
        image: spaceAvatar('b'),
      },
    ],
  },
  // ── Community Garden ──
  {
    id: 'mp-2',
    name: 'Community Garden',
    href: '/space/community-garden',
    tagline: 'Growing together — urban agriculture for everyone',
    isPrivate: false,
    roles: ['member'],
    initials: 'CG',
    color: '#8bc34a',
    image: spaceCard('1'),
    children: [
      {
        id: 'mp-2-1',
        name: 'Urban Farming',
        href: '/space/community-garden/urban-farming',
        isPrivate: false,
        roles: ['member'],
        initials: 'UF',
        color: '#7cb342',
        image: spaceAvatar('c'),
      },
    ],
  },
  // ── Digital Transformation (no subspaces) ──
  {
    id: 'mp-3',
    name: 'Digital Transformation',
    href: '/space/digital-trans',
    tagline: 'Reimagining work through technology',
    isPrivate: true,
    roles: ['admin'],
    initials: 'DT',
    color: '#42a5f5',
    image: spaceCard('2'),
  },
  // ── Innovation Lab ──
  {
    id: 'mp-4',
    name: 'Innovation Lab',
    href: '/space/innovation-lab',
    tagline: 'Experimental ground for breakthrough ideas',
    isPrivate: false,
    roles: ['lead'],
    initials: 'IL',
    color: '#ab47bc',
    image: spaceCard('custom'),
    children: [
      {
        id: 'mp-4-1',
        name: 'AI Research Collective',
        href: '/space/innovation-lab/ai-research',
        isPrivate: true,
        roles: ['member'],
        initials: 'AI',
        color: '#7e57c2',
        image: spaceAvatar('d'),
      },
      {
        id: 'mp-4-2',
        name: 'Design Thinking Practice',
        href: '/space/innovation-lab/design-thinking',
        isPrivate: false,
        roles: ['member'],
        initials: 'DT',
        color: '#ec407a',
        image: spaceAvatar('e'),
      },
    ],
  },
];

export const MOCK_SPACE_FILTER_OPTIONS = [
  { value: 'all-spaces', label: 'Space: All Spaces' },
  { value: 'green-energy', label: 'Green Energy Space' },
  { value: 'community-garden', label: 'Community Garden' },
];

export const MOCK_ROLE_FILTER_OPTIONS = [
  { value: 'all-roles', label: 'My role: All roles' },
  { value: 'facilitator', label: 'Facilitator' },
  { value: 'contributor', label: 'Contributor' },
];
