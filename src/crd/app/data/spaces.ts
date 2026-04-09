import type { SpaceCardData } from '@/crd/components/space/SpaceCard';

// Path helper for default space visuals (copied from public/default-visuals/)
// 'custom' represents a space whose owner uploaded their own image
const CUSTOM_CARD =
  'https://images.unsplash.com/photo-1684907110935-dcb64eba6add?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
const spaceCard = (hex: string) =>
  hex === 'custom' ? CUSTOM_CARD : `/default-visuals/space/card/alkemio-default-card-${hex}.jpg`;

const LEAD_AVATARS = {
  sarah:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
  david:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
  emily:
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
  james:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
  anna: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
  robert:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
  maria:
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
  tom: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
  nina: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
  lucas:
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
};

export const MOCK_SPACES: SpaceCardData[] = [
  // ── Top-level Spaces ──
  {
    id: 's1',
    name: 'Green Energy Space',
    description:
      'A collaborative space for exploring emerging technologies and building innovative prototypes that address real-world challenges.',
    bannerImageUrl: spaceCard('custom'),
    initials: 'GE',
    avatarColor: '#2563eb',
    isPrivate: false,
    isMember: true,
    tags: ['Innovation', 'Technology', 'Prototyping'],
    leads: [
      { name: 'Sarah Chen', avatarUrl: LEAD_AVATARS.sarah, type: 'person' },
      { name: 'TechBridge Foundation', avatarUrl: '', type: 'org' },
      { name: 'David Kim', avatarUrl: LEAD_AVATARS.david, type: 'person' },
    ],
    href: '/spaces/green-energy',
  },
  {
    id: 's2',
    name: 'Sustainable Futures',
    description:
      'Driving the transition to a sustainable economy through renewable energy solutions and circular business models.',
    bannerImageUrl: spaceCard('1'),
    initials: 'SF',
    avatarColor: '#16a34a',
    isPrivate: false,
    tags: ['Sustainability', 'Energy', 'Climate'],
    leads: [
      { name: 'Emily Davis', avatarUrl: LEAD_AVATARS.emily, type: 'person' },
      { name: 'Green Future Org', avatarUrl: '', type: 'org' },
    ],
    href: '/spaces/sustainable-futures',
  },
  {
    id: 's3',
    name: 'Community Building Lab',
    description:
      'Developing best practices for community engagement, participatory design, and inclusive collaboration methodologies.',
    bannerImageUrl: spaceCard('2'),
    initials: 'CB',
    avatarColor: '#9333ea',
    isPrivate: false,
    tags: ['Community', 'Engagement', 'Design'],
    leads: [
      { name: 'Anna Martinez', avatarUrl: LEAD_AVATARS.anna, type: 'person' },
      { name: 'Local Council', avatarUrl: '', type: 'org' },
      { name: 'James Wilson', avatarUrl: LEAD_AVATARS.james, type: 'person' },
    ],
    href: '/spaces/community-building',
  },
  {
    id: 's4',
    name: 'Urban Development Network',
    description:
      'Reimagining urban spaces through smart city planning, green infrastructure, and citizen-centered design approaches.',
    bannerImageUrl: spaceCard('3'),
    initials: 'UD',
    avatarColor: '#0891b2',
    isPrivate: false,
    tags: ['Urban', 'Planning', 'Smart Cities'],
    leads: [
      { name: 'Robert Fox', avatarUrl: LEAD_AVATARS.robert, type: 'person' },
      { name: 'City Planning Dept', avatarUrl: '', type: 'org' },
    ],
    href: '/spaces/urban-development',
  },
  {
    id: 's5',
    name: 'Education Transformation',
    description:
      'Rethinking education models for the 21st century with technology-enhanced learning and skills-based curricula.',
    bannerImageUrl: spaceCard('4'),
    initials: 'ET',
    avatarColor: '#ea580c',
    isPrivate: true,
    tags: ['Education', 'Learning', 'EdTech'],
    leads: [{ name: 'Maria Jansen', avatarUrl: LEAD_AVATARS.maria, type: 'person' }],
    href: '/spaces/education-transformation',
  },
  {
    id: 's6',
    name: 'Health Innovation Alliance',
    description:
      'Connecting healthcare professionals, researchers, and technologists to advance digital health and patient care.',
    bannerImageUrl: spaceCard('5'),
    initials: 'HI',
    avatarColor: '#dc2626',
    isPrivate: true,
    isMember: true,
    tags: ['Health', 'MedTech', 'Research'],
    leads: [
      { name: 'Tom Bakker', avatarUrl: LEAD_AVATARS.tom, type: 'person' },
      { name: 'Philips Health', avatarUrl: '', type: 'org' },
      { name: 'Nina van Dijk', avatarUrl: LEAD_AVATARS.nina, type: 'person' },
    ],
    href: '/spaces/health-innovation',
  },
  {
    id: 's7',
    name: 'Data-Driven Impact',
    description:
      'Leveraging data science and analytics to measure, optimize, and scale social and environmental impact programs.',
    bannerImageUrl: spaceCard('6'),
    initials: 'DD',
    avatarColor: '#4f46e5',
    isPrivate: false,
    tags: ['Data', 'Analytics', 'Impact'],
    leads: [{ name: 'Lucas de Boer', avatarUrl: LEAD_AVATARS.lucas, type: 'person' }],
    href: '/spaces/data-driven-impact',
  },
  {
    id: 's8',
    name: 'Social Entrepreneurship Hub',
    description:
      'Supporting social entrepreneurs with mentoring, funding, and a vibrant network to scale purpose-driven ventures.',
    bannerImageUrl: spaceCard('7'),
    initials: 'SE',
    avatarColor: '#c026d3',
    isPrivate: false,
    isMember: true,
    tags: ['Social Impact', 'Startups', 'Mentoring'],
    leads: [
      { name: 'Emily Davis', avatarUrl: LEAD_AVATARS.emily, type: 'person' },
      { name: 'Impact Foundation', avatarUrl: '', type: 'org' },
      { name: 'David Kim', avatarUrl: LEAD_AVATARS.david, type: 'person' },
      { name: 'Anna Martinez', avatarUrl: LEAD_AVATARS.anna, type: 'person' },
      { name: 'Robert Fox', avatarUrl: LEAD_AVATARS.robert, type: 'person' },
    ],
    href: '/spaces/social-entrepreneurship',
  },
  {
    id: 's9',
    name: 'Circular Economy Collective',
    description: 'Designing products, services, and systems that eliminate waste and keep resources in circulation.',
    bannerImageUrl: spaceCard('8'),
    initials: 'CE',
    avatarColor: '#059669',
    isPrivate: false,
    tags: ['Circular', 'Waste', 'Design'],
    leads: [
      { name: 'Sarah Chen', avatarUrl: LEAD_AVATARS.sarah, type: 'person' },
      { name: 'Green Future Org', avatarUrl: '', type: 'org' },
    ],
    href: '/spaces/circular-economy',
  },
  {
    id: 's10',
    name: 'Future Mobility',
    description:
      'Exploring autonomous vehicles, electric transport, and smart infrastructure for the cities of tomorrow.',
    bannerImageUrl: spaceCard('9'),
    initials: 'FM',
    avatarColor: '#0d9488',
    isPrivate: true,
    tags: ['Mobility', 'EV', 'Infrastructure'],
    leads: [
      { name: 'Tom Bakker', avatarUrl: LEAD_AVATARS.tom, type: 'person' },
      { name: 'NS Railways', avatarUrl: '', type: 'org' },
    ],
    href: '/spaces/future-mobility',
  },

  // ── Subspaces (children of top-level) ──
  {
    id: 's11',
    name: 'Renewable Energy Transition',
    description: 'Developing strategies for municipal energy transition to 100% renewables by 2030.',
    bannerImageUrl: spaceCard('a'),
    initials: 'RE',
    avatarColor: '#22c55e',
    isPrivate: false,
    isMember: true,
    tags: ['Wind', 'Solar', 'Transition'],
    leads: [
      { name: 'Emily Davis', avatarUrl: LEAD_AVATARS.emily, type: 'person' },
      { name: 'Eneco', avatarUrl: '', type: 'org' },
    ],
    href: '/spaces/sustainable-futures/renewable-energy-transition',
    parent: {
      name: 'Sustainable Futures',
      href: '/spaces/sustainable-futures',
      initials: 'SF',
      avatarColor: '#16a34a',
    },
  },
  {
    id: 's12',
    name: 'Smart Cities Lab',
    description:
      'Applying IoT, AI, and data analytics to create intelligent urban environments that improve quality of life.',
    bannerImageUrl: spaceCard('b'),
    initials: 'SC',
    avatarColor: '#0ea5e9',
    isPrivate: false,
    tags: ['IoT', 'AI', 'Urban Tech'],
    leads: [
      { name: 'Robert Fox', avatarUrl: LEAD_AVATARS.robert, type: 'person' },
      { name: 'Municipality Amsterdam', avatarUrl: '', type: 'org' },
    ],
    href: '/spaces/urban-development/smart-cities-lab',
    parent: {
      name: 'Urban Development Network',
      href: '/spaces/urban-development',
      initials: 'UD',
      avatarColor: '#0891b2',
    },
  },
  {
    id: 's13',
    name: 'Digital Health Tools',
    description:
      'Building and evaluating digital tools for remote patient monitoring, telemedicine, and wellness tracking.',
    bannerImageUrl: spaceCard('c'),
    initials: 'DH',
    avatarColor: '#ef4444',
    isPrivate: true,
    tags: ['Telemedicine', 'Wellness', 'Digital'],
    leads: [{ name: 'Nina van Dijk', avatarUrl: LEAD_AVATARS.nina, type: 'person' }],
    href: '/spaces/health-innovation/digital-health-tools',
    parent: {
      name: 'Health Innovation Alliance',
      href: '/spaces/health-innovation',
      initials: 'HI',
      avatarColor: '#dc2626',
    },
  },
  {
    id: 's14',
    name: 'AgriTech Innovation',
    description:
      'Advancing sustainable agriculture through precision farming, vertical gardens, and food system redesign.',
    bannerImageUrl: spaceCard('d'),
    initials: 'AT',
    avatarColor: '#65a30d',
    isPrivate: false,
    tags: ['Agriculture', 'Food', 'Farming'],
    leads: [
      { name: 'James Wilson', avatarUrl: LEAD_AVATARS.james, type: 'person' },
      { name: 'WUR Research', avatarUrl: '', type: 'org' },
    ],
    href: '/spaces/sustainable-futures/agritech-innovation',
    parent: {
      name: 'Sustainable Futures',
      href: '/spaces/sustainable-futures',
      initials: 'SF',
      avatarColor: '#16a34a',
    },
  },
  {
    id: 's15',
    name: 'Design Thinking Practice',
    description: 'Sharing frameworks, case studies, and tools for human-centered design in complex systems.',
    bannerImageUrl: spaceCard('e'),
    initials: 'DT',
    avatarColor: '#a855f7',
    isPrivate: false,
    tags: ['Design', 'HCD', 'Frameworks'],
    leads: [
      { name: 'Anna Martinez', avatarUrl: LEAD_AVATARS.anna, type: 'person' },
      { name: 'Maria Jansen', avatarUrl: LEAD_AVATARS.maria, type: 'person' },
    ],
    href: '/spaces/green-energy/design-thinking-practice',
    parent: {
      name: 'Green Energy Space',
      href: '/spaces/green-energy',
      initials: 'GE',
      avatarColor: '#2563eb',
    },
  },
  {
    id: 's16',
    name: 'Ocean & Marine Research',
    description:
      'Collaborative research on ocean health, marine biodiversity, and sustainable blue economy initiatives.',
    bannerImageUrl: spaceCard('f'),
    initials: 'OM',
    avatarColor: '#0369a1',
    isPrivate: false,
    tags: ['Ocean', 'Marine', 'Biodiversity'],
    leads: [{ name: 'Lucas de Boer', avatarUrl: LEAD_AVATARS.lucas, type: 'person' }],
    href: '/spaces/ocean-research',
  },
  {
    id: 's17',
    name: 'AI & Robotics Forum',
    description:
      'Exploring the ethical, practical, and technical dimensions of artificial intelligence and robotics in society.',
    bannerImageUrl: spaceCard('0'),
    initials: 'AR',
    avatarColor: '#6366f1',
    isPrivate: true,
    tags: ['AI', 'Robotics', 'Ethics'],
    leads: [
      { name: 'David Kim', avatarUrl: LEAD_AVATARS.david, type: 'person' },
      { name: 'TU Delft', avatarUrl: '', type: 'org' },
      { name: 'Sarah Chen', avatarUrl: LEAD_AVATARS.sarah, type: 'person' },
    ],
    href: '/spaces/green-energy/ai-robotics',
    parent: {
      name: 'Green Energy Space',
      href: '/spaces/green-energy',
      initials: 'GE',
      avatarColor: '#2563eb',
    },
  },
  {
    id: 's18',
    name: 'Climate Action Network',
    description: 'Coordinating climate adaptation and mitigation strategies across sectors, regions, and communities.',
    bannerImageUrl: spaceCard('1'),
    initials: 'CA',
    avatarColor: '#15803d',
    isPrivate: false,
    tags: ['Climate', 'Adaptation', 'Policy'],
    leads: [
      { name: 'Emily Davis', avatarUrl: LEAD_AVATARS.emily, type: 'person' },
      { name: 'Green Future Org', avatarUrl: '', type: 'org' },
      { name: 'Tom Bakker', avatarUrl: LEAD_AVATARS.tom, type: 'person' },
    ],
    href: '/spaces/climate-action',
  },
  {
    id: 's19',
    name: 'Startup Incubator',
    description:
      'An intensive program for early-stage ventures with access to mentorship, workspace, and seed funding.',
    bannerImageUrl: spaceCard('2'),
    initials: 'SI',
    avatarColor: '#e11d48',
    isPrivate: true,
    tags: ['Startups', 'Funding', 'Incubation'],
    leads: [
      { name: 'James Wilson', avatarUrl: LEAD_AVATARS.james, type: 'person' },
      { name: 'Robert Fox', avatarUrl: LEAD_AVATARS.robert, type: 'person' },
    ],
    href: '/spaces/social-entrepreneurship/startup-incubator',
    parent: {
      name: 'Social Entrepreneurship Hub',
      href: '/spaces/social-entrepreneurship',
      initials: 'SE',
      avatarColor: '#c026d3',
    },
  },
  {
    id: 's20',
    name: 'Nature & Biodiversity',
    description:
      'Protecting and restoring natural ecosystems through citizen science, conservation tech, and policy advocacy.',
    bannerImageUrl: spaceCard('3'),
    initials: 'NB',
    avatarColor: '#166534',
    isPrivate: false,
    tags: ['Nature', 'Conservation', 'Science'],
    leads: [
      { name: 'Lucas de Boer', avatarUrl: LEAD_AVATARS.lucas, type: 'person' },
      { name: 'Anna Martinez', avatarUrl: LEAD_AVATARS.anna, type: 'person' },
    ],
    href: '/spaces/nature-biodiversity',
  },
  {
    id: 's21',
    name: 'Coworking & Spaces Network',
    description: 'Connecting coworking space operators and remote workers to share best practices and build community.',
    bannerImageUrl: spaceCard('4'),
    initials: 'CN',
    avatarColor: '#d97706',
    isPrivate: false,
    tags: ['Coworking', 'Remote', 'Community'],
    leads: [{ name: 'Maria Jansen', avatarUrl: LEAD_AVATARS.maria, type: 'person' }],
    href: '/spaces/coworking-network',
  },
  {
    id: 's22',
    name: 'Water & Infrastructure',
    description:
      'Developing resilient water management systems and climate-adaptive infrastructure for Dutch water challenges.',
    bannerImageUrl: spaceCard('5'),
    initials: 'WI',
    avatarColor: '#0284c7',
    isPrivate: false,
    tags: ['Water', 'Infrastructure', 'Climate'],
    leads: [
      { name: 'Tom Bakker', avatarUrl: LEAD_AVATARS.tom, type: 'person' },
      { name: 'Rijkswaterstaat', avatarUrl: '', type: 'org' },
    ],
    href: '/spaces/urban-development/water-infrastructure',
    parent: {
      name: 'Urban Development Network',
      href: '/spaces/urban-development',
      initials: 'UD',
      avatarColor: '#0891b2',
    },
  },
  {
    id: 's23',
    name: 'Cultural Heritage & Digital',
    description:
      'Using digital technologies to preserve, share, and reimagine cultural heritage for future generations.',
    bannerImageUrl: spaceCard('6'),
    initials: 'CH',
    avatarColor: '#b45309',
    isPrivate: false,
    tags: ['Heritage', 'Digital', 'Culture'],
    leads: [{ name: 'Nina van Dijk', avatarUrl: LEAD_AVATARS.nina, type: 'person' }],
    href: '/spaces/cultural-heritage-digital',
  },
  {
    id: 's24',
    name: 'Cybersecurity & Trust',
    description:
      'Building secure digital infrastructure and fostering trust through responsible data governance practices.',
    bannerImageUrl: spaceCard('7'),
    initials: 'CT',
    avatarColor: '#64748b',
    isPrivate: true,
    tags: ['Security', 'Privacy', 'Governance'],
    leads: [
      { name: 'David Kim', avatarUrl: LEAD_AVATARS.david, type: 'person' },
      { name: 'TNO', avatarUrl: '', type: 'org' },
    ],
    href: '/spaces/data-driven-impact/cybersecurity-trust',
    parent: {
      name: 'Data-Driven Impact',
      href: '/spaces/data-driven-impact',
      initials: 'DD',
      avatarColor: '#4f46e5',
    },
  },
  {
    id: 's25',
    name: 'EV Charging Network',
    description:
      'Accelerating the rollout of electric vehicle charging infrastructure across the Netherlands and Europe.',
    bannerImageUrl: spaceCard('8'),
    initials: 'EV',
    avatarColor: '#0d9488',
    isPrivate: false,
    tags: ['EV', 'Charging', 'Clean Energy'],
    leads: [
      { name: 'Robert Fox', avatarUrl: LEAD_AVATARS.robert, type: 'person' },
      { name: 'Shell Ventures', avatarUrl: '', type: 'org' },
      { name: 'Emily Davis', avatarUrl: LEAD_AVATARS.emily, type: 'person' },
    ],
    href: '/spaces/future-mobility/ev-charging-network',
    parent: {
      name: 'Future Mobility',
      href: '/spaces/future-mobility',
      initials: 'FM',
      avatarColor: '#0d9488',
    },
  },
];
