export const MOCK_RECENT_SPACES = [
  {
    id: 'rs-1',
    name: 'Innovation Lab',
    href: '/space/innovation-lab',
    bannerUrl:
      'https://images.unsplash.com/photo-1623652554515-91c833e3080e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsYWJvcmF0aW9uJTIwdGVhbXdvcmslMjBpbm5vdmF0aW9uJTIwZGVzaWduJTIwdGhpbmtpbmclMjB3b3Jrc2hvcHxlbnwxfHx8fDE3NjkwODc1ODd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    isPrivate: true,
    isHomeSpace: true,
    initials: 'IL',
  },
  {
    id: 'rs-2',
    name: 'Design Workshop',
    href: '/space/design-workshop',
    bannerUrl:
      'https://images.unsplash.com/photo-1735639013995-086e648eaa38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFpbnN0b3JtaW5nJTIwY3JlYXRpdmUlMjB3b3Jrc2hvcCUyMHRlYW18ZW58MXx8fHwxNzY5MDg3NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    isPrivate: false,
    isHomeSpace: false,
    initials: 'DW',
  },
  {
    id: 'rs-3',
    name: 'Team Sync',
    href: '/space/team-sync',
    bannerUrl:
      'https://images.unsplash.com/photo-1768659347532-74d3b1efb0ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjBtZWV0aW5nJTIwY29sbGFib3JhdGlvbiUyMHRlYW18ZW58MXx8fHwxNzY5MDg3NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    isPrivate: true,
    isHomeSpace: false,
    initials: 'TS',
  },
  {
    id: 'rs-4',
    name: 'Future Strategy',
    href: '/space/future-strategy',
    bannerUrl:
      'https://images.unsplash.com/photo-1676276376052-dc9c9c0b6917?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbm5vdmF0aW9uJTIwbGFiJTIwdGVhbXdvcmslMjBtb2Rlcm4lMjBvZmZpY2V8ZW58MXx8fHwxNzY5MDg3NTg2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    isPrivate: false,
    isHomeSpace: false,
    initials: 'FS',
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
    spaceAvatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    role: 'Editor',
  },
  {
    id: 'inv-2',
    spaceId: 's-urban-mobility',
    spaceName: 'Urban Mobility Lab',
    spaceHref: '/space/urban-mobility',
    spaceAvatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150',
    role: 'Viewer',
  },
  {
    id: 'inv-3',
    spaceId: 's-financial',
    spaceName: 'Q1 Financial Planning',
    spaceHref: '/space/financial-planning',
    spaceAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    role: 'Admin',
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
