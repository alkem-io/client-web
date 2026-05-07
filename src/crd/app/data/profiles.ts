/**
 * Mock data for the standalone demo pages of the new CRD profile components
 * (User, Organization, VC). Pulls Alex Rivera from the prototype's
 * `prototype/src/app/pages/UserProfilePage.tsx` and adds matching demos for
 * Organization + VC so designers can see all three profile types side by side.
 *
 * NB: These are plain TypeScript values shaped to match the corresponding CRD
 * view-prop types — no GraphQL, no Apollo, no integration layer. The standalone
 * demo pages render the CRD components directly with this data.
 */

import type { CompactContributorCardItem } from '@/crd/components/common/CompactContributorCard';
import type {
  AssociateGridItem,
  ReferenceLink,
  TagsetGroup,
} from '@/crd/components/organization/OrganizationProfileSidebar';
import type { SimpleResourceCardItem } from '@/crd/components/organization/OrganizationResourceSections';
import type { SpaceGridCardData } from '@/crd/components/user/SpaceGridCard';
import type { VirtualContributorCardItem } from '@/crd/components/user/UserResourceSections';
import type { VCAiEngineSectionData } from '@/crd/components/virtualContributor/VCAiEngineGrid';
import type { BodyOfKnowledge } from '@/crd/components/virtualContributor/VCBodyOfKnowledgeSection';
import type { VCFunctionalitySectionData } from '@/crd/components/virtualContributor/VCFunctionalityGrid';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

/* --------------------------------------------------------------------- */
/*  Shared building blocks                                                */
/* --------------------------------------------------------------------- */

const SPACE_BANNER_URL =
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
const SPACE_BANNER_TRAFFIC =
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
const SPACE_BANNER_GREEN =
  'https://images.unsplash.com/photo-1448375240586-dfd8d3cd6052?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
const SPACE_BANNER_TRANSIT =
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
const SPACE_BANNER_GARDENS =
  'https://images.unsplash.com/photo-1589923188900-85dae523342b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
const SPACE_BANNER_HACKING =
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';

/* --------------------------------------------------------------------- */
/*  Alex Rivera — public User profile (other-user view)                   */
/* --------------------------------------------------------------------- */

export const MOCK_ALEX_RIVERA = {
  id: 'user-alex-rivera',
  slug: 'alex-rivera',
  hero: {
    avatarImageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    color: pickColorFromId('user-alex-rivera'),
    displayName: 'Alex Rivera',
    location: 'San Francisco, US',
  },
  bio:
    'Passionate about sustainable urban planning and civic technology. Leading the transition to renewable energy grids at CityScale.\n\nAlways looking for collaborators on open source climate data projects. Feel free to reach out if you\'re interested in smart city infrastructure!',
  tagsets: [
    { key: 'keywords', name: 'Keywords', tags: ['Smart Cities', 'Renewables', 'Civic Tech'] },
    { key: 'skills', name: 'Skills', tags: ['Urban Planning', 'GIS', 'Python', 'Stakeholder Engagement'] },
  ] satisfies TagsetGroup[],
  organizations: [
    {
      id: 'org-cityscale',
      displayName: 'CityScale',
      avatarImageUrl:
        'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      caption: 'Director of Innovation',
      secondaryCaption: null,
      href: '/organization/cityscale',
      memberCount: 142,
    },
    {
      id: 'org-open-climate-fix',
      displayName: 'Open Climate Fix',
      avatarImageUrl:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      caption: 'Contributor',
      secondaryCaption: null,
      href: '/organization/open-climate-fix',
      memberCount: 850,
    },
    {
      id: 'org-urban-tech-alliance',
      displayName: 'Urban Tech Alliance',
      avatarImageUrl:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      caption: 'Member',
      secondaryCaption: null,
      href: '/organization/urban-tech-alliance',
      memberCount: 2400,
    },
  ] satisfies Array<CompactContributorCardItem & { memberCount: number }>,
  hostedSpaces: [
    {
      id: 'space-renewable-energy-grid',
      title: 'Renewable Energy Grid',
      description:
        'Collaborating on the future of distributed energy resources and microgrid implementation.',
      href: '/space/renewable-energy-grid',
      imageUrl: SPACE_BANNER_URL,
      color: pickColorFromId('space-renewable-energy-grid'),
      isPrivate: false,
    },
    {
      id: 'space-smart-traffic',
      title: 'Smart Traffic Systems',
      description: 'AI-driven traffic management solutions for mid-sized cities.',
      href: '/space/smart-traffic',
      imageUrl: SPACE_BANNER_TRAFFIC,
      color: pickColorFromId('space-smart-traffic'),
      isPrivate: true,
    },
  ] satisfies SpaceGridCardData[],
  hostedVirtualContributors: [
    {
      id: 'vc-datasynth',
      displayName: 'DataSynth Bot',
      description: 'Generates synthetic datasets for urban modeling.',
      type: 'AI Model',
      href: '/vc/datasynth-bot',
    },
    {
      id: 'vc-policyscanner',
      displayName: 'PolicyScanner',
      description: 'Scans municipal meeting minutes for keywords.',
      type: 'Scraper',
      href: '/vc/policyscanner',
    },
  ] satisfies VirtualContributorCardItem[],
  // Backend field: account.innovationPacks. UI label: "Template Packs".
  hostedInnovationPacks: [
    {
      id: 'pack-circular-toolkit',
      displayName: 'Circular Economy Toolkit',
      description: 'Workshop templates and assessment frameworks for circular-economy programmes.',
      href: '/innovation-packs/circular-toolkit',
      avatarImageUrl: null,
    },
    {
      id: 'pack-citizen-assemblies',
      displayName: 'Citizen Assemblies',
      description: 'Plug-and-play structure for running deliberative-democracy sessions.',
      href: '/innovation-packs/citizen-assemblies',
      avatarImageUrl: null,
    },
    {
      id: 'pack-co-design-canvas',
      displayName: 'Co-Design Canvas',
      description: 'A printable canvas for facilitating multi-stakeholder co-design.',
      href: '/innovation-packs/co-design-canvas',
      avatarImageUrl: null,
    },
  ] satisfies SimpleResourceCardItem[],
  // Backend field: account.innovationHubs. UI label: "Custom Homepages".
  hostedInnovationHubs: [
    {
      id: 'hub-mobility-lab',
      displayName: 'Mobility Lab',
      description: 'Curated showcase of urban-mobility experiments across European cities.',
      href: '/hub/mobility-lab',
      avatarImageUrl: null,
    },
  ] satisfies SimpleResourceCardItem[],
  leadingSpaces: [
    {
      id: 'space-urban-green',
      title: 'Urban Green Spaces',
      description:
        'Designing accessible parks and recreational areas in dense urban environments.',
      href: '/space/urban-green-spaces',
      imageUrl: SPACE_BANNER_GREEN,
      color: pickColorFromId('space-urban-green'),
      isPrivate: false,
    },
  ] satisfies SpaceGridCardData[],
  memberSpaces: [
    {
      id: 'space-public-transit',
      title: 'Public Transit Data',
      description: 'Open data standards for public transportation systems.',
      href: '/space/public-transit',
      imageUrl: SPACE_BANNER_TRANSIT,
      color: pickColorFromId('space-public-transit'),
      isPrivate: false,
    },
    {
      id: 'space-community-gardens',
      title: 'Community Gardens',
      description: 'Local food production initiatives.',
      href: '/space/community-gardens',
      imageUrl: SPACE_BANNER_GARDENS,
      color: pickColorFromId('space-community-gardens'),
      isPrivate: false,
    },
    {
      id: 'space-civic-hacking',
      title: 'Civic Hacking',
      description: 'Weekly hackathons for civic tech projects.',
      href: '/space/civic-hacking',
      imageUrl: SPACE_BANNER_HACKING,
      color: pickColorFromId('space-civic-hacking'),
      isPrivate: false,
    },
  ] satisfies SpaceGridCardData[],
};

/* --------------------------------------------------------------------- */
/*  "Me" — self-view of the current user                                  */
/* --------------------------------------------------------------------- */

export const MOCK_ME_USER = {
  ...MOCK_ALEX_RIVERA,
  // Demo distinction: a different display name so designers can tell at a
  // glance which page is "self" vs. "other".
  hero: {
    ...MOCK_ALEX_RIVERA.hero,
    displayName: 'Sam Lee',
    avatarImageUrl: 'https://i.pravatar.cc/300?u=sam-lee' as string | null,
    color: pickColorFromId('user-me'),
    location: 'Amsterdam, Netherlands',
  },
  id: 'user-me',
  slug: 'sam-lee',
  bio:
    "I'm a sustainability strategist and the platform owner of this Alkemio space. " +
    'I help cities and corporations align their innovation programs with measurable ' +
    'climate outcomes.',
  tagsets: [
    { key: 'keywords', name: 'Keywords', tags: ['Sustainability', 'Innovation Strategy', 'Climate'] },
    { key: 'skills', name: 'Skills', tags: ['Strategy', 'Facilitation', 'Programme Design'] },
  ] satisfies TagsetGroup[],
  references: [
    { id: 'sam-linkedin', name: 'LinkedIn', uri: 'https://www.linkedin.com/in/sam-lee', description: null },
    { id: 'sam-github', name: 'GitHub', uri: 'https://github.com/sam-lee', description: null },
    { id: 'sam-bsky', name: 'bsky', uri: 'https://bsky.app/profile/samlee.bsky.social', description: null },
    { id: 'sam-website', name: 'website', uri: 'https://samlee.dev', description: null },
    { id: 'sam-email', name: 'email', uri: 'sam@samlee.dev', description: null },
  ] satisfies ReferenceLink[],
};

/* --------------------------------------------------------------------- */
/*  Organization — Alkemio                                                */
/* --------------------------------------------------------------------- */

export const MOCK_ORG_ALKEMIO = {
  id: 'org-alkemio',
  slug: 'alkemio',
  hero: {
    avatarImageUrl: null as string | null,
    color: pickColorFromId('org-alkemio'),
    displayName: 'Alkemio Foundation',
    location: 'Amsterdam, Netherlands',
    verified: true,
  },
  bio:
    'Alkemio is a mission-driven non-profit building open digital infrastructure for ' +
    'collaborative innovation. We help organizations co-design solutions to societal ' +
    'challenges — from circular economy to inclusive education.',
  tagsets: [
    { key: 'keywords', name: 'Keywords', tags: ['Open Source', 'Climate', 'Civic Tech', 'Co-Design'] },
    { key: 'capabilities', name: 'Capabilities', tags: ['Facilitation', 'Platform engineering', 'Research'] },
  ] satisfies TagsetGroup[],
  references: [
    // Non-social refs go to the sidebar's References section.
    {
      id: 'ref-handbook',
      name: 'Foundation handbook',
      uri: 'https://alkem.io/handbook',
      description: null,
    },
    {
      id: 'ref-paper',
      name: 'Whitepaper (PDF)',
      uri: 'https://alkem.io/whitepaper.pdf',
      description: 'Methodology overview',
    },
    // Social refs (name === one of website/linkedin/github/bsky/youtube/email)
    // go to the sidebar's Social section, rendered by <SocialLinks>.
    { id: 's-website', name: 'website', uri: 'https://alkem.io', description: null },
    { id: 's-linkedin', name: 'LinkedIn', uri: 'https://www.linkedin.com/company/alkemio', description: null },
    { id: 's-github', name: 'GitHub', uri: 'https://github.com/alkem-io', description: null },
    { id: 's-youtube', name: 'YouTube', uri: 'https://youtube.com/@alkemio', description: null },
    { id: 's-bsky', name: 'bsky', uri: 'https://bsky.app/profile/alkemio.bsky.social', description: null },
    { id: 's-email', name: 'email', uri: 'hello@alkem.io', description: null },
  ] satisfies ReferenceLink[],
  associates: [
    { id: 'a1', displayName: 'Sarah Chen', avatarImageUrl: 'https://i.pravatar.cc/150?img=1', url: '/user/sarah-chen' },
    { id: 'a2', displayName: 'Jordan Park', avatarImageUrl: 'https://i.pravatar.cc/150?img=2', url: '/user/jordan-park' },
    { id: 'a3', displayName: 'Maria Silva', avatarImageUrl: 'https://i.pravatar.cc/150?img=3', url: '/user/maria-silva' },
    { id: 'a4', displayName: 'Daniel Okafor', avatarImageUrl: 'https://i.pravatar.cc/150?img=4', url: '/user/daniel-okafor' },
    { id: 'a5', displayName: 'Priya Patel', avatarImageUrl: 'https://i.pravatar.cc/150?img=5', url: '/user/priya-patel' },
    { id: 'a6', displayName: 'Liam Murphy', avatarImageUrl: 'https://i.pravatar.cc/150?img=6', url: '/user/liam-murphy' },
    { id: 'a7', displayName: 'Yuki Tanaka', avatarImageUrl: 'https://i.pravatar.cc/150?img=7', url: '/user/yuki-tanaka' },
    { id: 'a8', displayName: 'Noor Hassan', avatarImageUrl: 'https://i.pravatar.cc/150?img=8', url: '/user/noor-hassan' },
    { id: 'a9', displayName: 'Eva Novak', avatarImageUrl: 'https://i.pravatar.cc/150?img=9', url: '/user/eva-novak' },
    { id: 'a10', displayName: 'Andre Costa', avatarImageUrl: 'https://i.pravatar.cc/150?img=10', url: '/user/andre-costa' },
    { id: 'a11', displayName: 'Mei Zhang', avatarImageUrl: 'https://i.pravatar.cc/150?img=11', url: '/user/mei-zhang' },
    { id: 'a12', displayName: 'Tom Becker', avatarImageUrl: 'https://i.pravatar.cc/150?img=12', url: '/user/tom-becker' },
    { id: 'a13', displayName: 'Anna Petrov', avatarImageUrl: 'https://i.pravatar.cc/150?img=13', url: '/user/anna-petrov' },
    { id: 'a14', displayName: 'Felipe Reyes', avatarImageUrl: 'https://i.pravatar.cc/150?img=14', url: '/user/felipe-reyes' },
  ] satisfies AssociateGridItem[],
  associatesTotal: 142,
  // Phase-10 refined shape: 4 separate hosted-resource arrays — Spaces, VCs,
  // Template Packs (`innovationPacks`), Custom Homepages (`innovationHubs`) —
  // matching the User profile. Organisations CAN host VCs (rare in production
  // today, included here to exercise the sub-section).
  hostedSpaces: [
    {
      id: 'space-renewable-energy-grid',
      title: 'Renewable Energy Grid',
      description: 'Distributed energy resources and microgrid implementation.',
      href: '/space/renewable-energy-grid',
      imageUrl: SPACE_BANNER_URL,
      color: pickColorFromId('space-renewable-energy-grid'),
      isPrivate: false,
    },
    {
      id: 'space-smart-traffic',
      title: 'Smart Traffic Systems',
      description: 'AI-driven traffic management solutions.',
      href: '/space/smart-traffic',
      imageUrl: SPACE_BANNER_TRAFFIC,
      color: pickColorFromId('space-smart-traffic'),
      isPrivate: true,
    },
    {
      id: 'space-urban-green',
      title: 'Urban Green Spaces',
      description: 'Accessible parks and recreational areas in dense urban environments.',
      href: '/space/urban-green-spaces',
      imageUrl: SPACE_BANNER_GREEN,
      color: pickColorFromId('space-urban-green'),
      isPrivate: false,
    },
    {
      id: 'space-public-transit',
      title: 'Public Transit Data',
      description: 'Open data standards for transportation systems.',
      href: '/space/public-transit',
      imageUrl: SPACE_BANNER_TRANSIT,
      color: pickColorFromId('space-public-transit'),
      isPrivate: false,
    },
  ] satisfies SpaceGridCardData[],
  hostedVirtualContributors: [
    {
      id: 'vc-org-policyscanner',
      displayName: 'Foundation PolicyScanner',
      description: 'Surveys municipal policy texts for sustainability commitments.',
      type: 'AI Model',
      href: '/vc/foundation-policyscanner',
    },
  ] satisfies VirtualContributorCardItem[],
  hostedInnovationPacks: [
    {
      id: 'pack-circular-toolkit',
      displayName: 'Circular Economy Toolkit',
      description: 'Templates and methods for circular-economy facilitation sessions.',
      href: '/innovation-packs/circular-toolkit',
      avatarImageUrl: null,
    },
    {
      id: 'pack-citizen-assemblies',
      displayName: 'Citizen Assembly Pack',
      description: 'Methods for running deliberative citizen assemblies.',
      href: '/innovation-packs/citizen-assemblies',
      avatarImageUrl: null,
    },
  ] satisfies SimpleResourceCardItem[],
  hostedInnovationHubs: [
    {
      id: 'hub-climate',
      displayName: 'Climate Action Hub',
      description: 'Custom homepage curating climate-action programs.',
      href: 'https://climate.alkem.io',
      avatarImageUrl: null,
    },
  ] satisfies SimpleResourceCardItem[],
  leadSpaces: [
    {
      id: 'space-renewable-energy-grid',
      title: 'Renewable Energy Grid',
      description: 'Distributed energy resources and microgrid implementation.',
      href: '/space/renewable-energy-grid',
      imageUrl: SPACE_BANNER_URL,
      color: pickColorFromId('space-renewable-energy-grid'),
      isPrivate: false,
    },
  ] satisfies SpaceGridCardData[],
  memberOfSpaces: [
    {
      id: 'space-public-transit',
      title: 'Public Transit Data',
      description: 'Open data standards for transportation systems.',
      href: '/space/public-transit',
      imageUrl: SPACE_BANNER_TRANSIT,
      color: pickColorFromId('space-public-transit'),
      isPrivate: false,
    },
    {
      id: 'space-community-gardens',
      title: 'Community Gardens',
      description: 'Local food production initiatives.',
      href: '/space/community-gardens',
      imageUrl: SPACE_BANNER_GARDENS,
      color: pickColorFromId('space-community-gardens'),
      isPrivate: false,
    },
  ] satisfies SpaceGridCardData[],
};

/* --------------------------------------------------------------------- */
/*  Virtual Contributor — DataSynth Bot                                   */
/* --------------------------------------------------------------------- */

export const MOCK_VC_DATASYNTH = {
  id: 'vc-datasynth',
  slug: 'datasynth-bot',
  hero: {
    avatarImageUrl: null as string | null,
    color: pickColorFromId('vc-datasynth'),
    displayName: 'DataSynth Bot',
    keywords: ['Synthetic data', 'Urban modeling', 'Research', 'EU-hosted'],
  },
  description:
    'DataSynth generates synthetic datasets for urban-modeling research projects. ' +
    'It works from a curated base of city-scale knowledge ingested from the host space.',
  host: {
    id: 'host-cityscale',
    displayName: 'CityScale',
    avatarImageUrl:
      'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    caption: 'Provider',
    secondaryCaption: null,
    href: '/organization/cityscale',
  } as CompactContributorCardItem,
  // 2026-05-06 redesign: ALL references rendered as a flat URL-chip list in
  // the sidebar (FR-032). No social/non-social split.
  references: [
    {
      id: 'vc-ref-1',
      name: 'Synthetic data primer',
      uri: 'https://en.wikipedia.org/wiki/Synthetic_data',
      description: 'Background reading on synthetic data.',
    },
    { id: 'vc-s-github', name: 'GitHub', uri: 'https://github.com/alkem-io/datasynth', description: null },
    { id: 'vc-s-website', name: 'website', uri: 'https://datasynth.example/', description: null },
  ] satisfies ReferenceLink[],
  bodyOfKnowledge: {
    kind: 'space',
    spaceProfile: {
      id: 'space-renewable-energy-grid',
      url: '/space/renewable-energy-grid',
      displayName: 'Renewable Energy Grid',
      level: 'L0',
      avatarImageUrl: null,
      color: '#42a5f5',
      initials: 'RE',
    },
    hasReadAccess: true,
    description: 'Trained on the open knowledge base of the Renewable Energy Grid space.',
    vcDisplayName: 'DataSynth Bot',
    spaceContextDescription:
      "DataSynth Bot's knowledge is sourced from the Renewable Energy Grid space.",
  } as BodyOfKnowledge,
  // 2026-05-06 redesign: Functionality / AI Engine / Monitoring shapes per
  // contracts/vcProfile.ts. Mixed flags exercise Check vs. Minus glyphs;
  // SpaceRoleMember enabled exercises the <Trans>-rendered <strong> path;
  // canAccessWebWhenAnswering=false exercises the Clock glyph; null
  // isInteractionDataUsedForTraining exercises the "Unknown" fallback.
  functionality: {
    capabilities: [
      { label: 'Answer questions in comments', enabled: true },
      { label: 'Create new posts', enabled: false },
      { label: 'Invite other contributors', enabled: false },
    ],
    dataAccess: [
      { label: 'About page', enabled: true },
      { label: 'Posts & Contributions', enabled: true },
      { label: 'Subspaces', enabled: false },
    ],
    roleRequirements: { kind: 'memberRequired' },
  } satisfies VCFunctionalitySectionData,
  aiEngine: {
    engineName: 'Alkemio AI',
    cards: [
      {
        id: 'openModelTransparency',
        iconName: 'eye',
        title: 'Open Model Transparency',
        description: 'Does the VC use an open-weight model?',
        booleanAnswer: { value: true },
      },
      {
        id: 'dataUsageDisclosure',
        iconName: 'database',
        title: 'Data Usage Disclosure',
        description: 'Is interaction data used in any way for model training?',
        textValue: '',
      },
      {
        id: 'knowledgeRestriction',
        iconName: 'shieldCheck',
        title: 'Knowledge Restriction',
        description: 'Is the VC prompted to limit the responses to a specific body of knowledge?',
        textValue: 'Yes',
      },
      {
        id: 'webAccess',
        iconName: 'globe',
        title: 'Web Access',
        description: 'Can the VC access or search the web?',
        booleanAnswer: { value: false, noIcon: 'clock' },
      },
      {
        id: 'physicalLocation',
        iconName: 'mapPin',
        title: 'Physical Location',
        description: 'Where is the AI service hosted?',
        textValue: 'EU (Amsterdam)',
      },
      {
        id: 'technicalReferences',
        iconName: 'fileText',
        title: 'Technical References',
        description: 'Access to detailed information on the underlying models specifications',
        action: { href: 'https://example.com/tech-details.pdf', label: 'SEE DOCUMENTATION' },
      },
    ],
  } satisfies VCAiEngineSectionData,
};
