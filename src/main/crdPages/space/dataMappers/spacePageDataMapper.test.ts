import { describe, expect, test } from 'vitest';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { MembershipStatus, type SpaceDocumentFragment, SpaceStatus } from '@/core/apollo/generated-v2/graphql-schema';
import type { SpaceAboutData } from '@/crd/components/space/SpaceAboutView';
import { mapNativeMembersToMemberCards, mapRoleSetToMemberCards } from './communityDataMapper';
import { actorsOfType, mapNativeSpaceAbout, mapSidebarLeads, nativeClassifications } from './spacePageDataMapper';

// ---- Legacy oracle: the About mapping of C 71f8ddcf7 main/crdPages/space/about/CrdSpaceAbout.tsx:68-131 ----
type LegacyProfile = {
  displayName: string;
  url: string;
  avatar?: { uri: string };
  location?: { city?: string; country?: string };
};
type LegacyAbout = {
  profile: { displayName: string; tagline?: string; description?: string; location?: LegacyProfile['location'] };
  metrics: { name: string; value: string }[];
  provider?: { profile?: LegacyProfile };
  membership: { leadUsers: { profile?: LegacyProfile }[]; leadOrganizations: { profile?: LegacyProfile }[] };
  tags: string[];
};
const legacyLead = (type: 'person' | 'organization') => (profile: LegacyProfile) => ({
  name: profile.displayName,
  avatarUrl: profile.avatar?.uri,
  type,
  location: [profile.location?.city, profile.location?.country].filter(Boolean).join(', ') || undefined,
  href: profile.url,
});
const legacyAboutData = (about: LegacyAbout): SpaceAboutData => ({
  name: about.profile.displayName,
  tagline: about.profile.tagline,
  description: about.profile.description,
  location: [about.profile.location?.city, about.profile.location?.country].filter(Boolean).join(', ') || undefined,
  metrics: about.metrics,
  provider: about.provider?.profile ? legacyLead('organization')(about.provider.profile) : undefined,
  leadUsers: about.membership.leadUsers.flatMap(u => (u.profile ? [legacyLead('person')(u.profile)] : [])),
  leadOrganizations: about.membership.leadOrganizations.flatMap(o =>
    o.profile ? [legacyLead('organization')(o.profile)] : []
  ),
  references: [],
  tags: about.tags,
  classifications: [],
});

// ---- D2 fixtures: the Space document, its faces with their locations and its About's facets ----
const actor = (id: string, actorType: string, city: string | null) => ({
  __typename: 'User' as const,
  id,
  actorType,
  url: `/${id}`,
  about: {
    displayName: id.toUpperCase(),
    avatar: { file: { url: `https://files/${id}.png` } },
    location: { city, country: 'NL' },
  },
});
const can = Object.fromEntries(
  ['read', 'update', 'delete', 'archive', 'createPost', 'createSubspace', 'createDocument', 'invite']
    .concat(['manageMembers', 'manageTemplates', 'upload', 'readActivity', 'saveAsTemplate', 'join', 'apply'])
    .map(flag => [flag, false])
) as unknown as SpaceDocumentFragment['can'];
const doc = (overrides: Partial<SpaceDocumentFragment>): SpaceDocumentFragment => ({
  id: 'space',
  handle: 'space',
  url: '/space',
  depth: 0,
  status: SpaceStatus.Active,
  createdAt: '2026-01-01T00:00:00Z',
  tags: ['green', 'energy'],
  isContentPublic: false,
  about: { displayName: 'Green Space', tagline: 'Tag line', description: 'Long text', location: null, facets: [] },
  can,
  ...overrides,
});

// Reader: every field at its READ tier.
const reader = doc({
  memberCount: 12,
  about: {
    displayName: 'Green Space',
    tagline: 'Tag line',
    description: 'Long text',
    location: { city: 'Amsterdam', country: 'NL' },
    facets: [],
  },
  host: { ...actor('host-org', 'organization', 'Utrecht'), account: null },
  leads: [actor('ann', 'user', 'Delft'), actor('org', 'organization', null), actor('bob', 'user', null)],
  membership: { roles: ['member'], status: MembershipStatus.Member },
});
const legacyProfile = (id: string, city?: string): LegacyProfile => ({
  displayName: id.toUpperCase(),
  url: `/${id}`,
  avatar: { uri: `https://files/${id}.png` },
  location: { city, country: 'NL' },
});
const legacyReader: LegacyAbout = {
  profile: {
    displayName: 'Green Space',
    tagline: 'Tag line',
    description: 'Long text',
    location: { city: 'Amsterdam', country: 'NL' },
  },
  metrics: [{ name: 'members', value: '12' }],
  provider: { profile: legacyProfile('host-org', 'Utrecht') },
  membership: {
    leadUsers: [{ profile: legacyProfile('ann', 'Delft') }, { profile: legacyProfile('bob') }],
    leadOrganizations: [{ profile: legacyProfile('org') }],
  },
  tags: ['green', 'energy'],
};

// Face-only (and anonymous): the face tier — leads, host, own membership, location and memberCount are null until
// the face additions requested of WP-SEEDFIX1 are declared (021 tasks.md S07), and render as absent data.
const faceOnly = doc({ memberCount: null, host: null, leads: null, membership: null });
const legacyFaceOnly: LegacyAbout = {
  profile: { displayName: 'Green Space', tagline: 'Tag line', description: 'Long text' },
  metrics: [],
  membership: { leadUsers: [], leadOrganizations: [] },
  tags: ['green', 'energy'],
};
const anonymous = doc({
  memberCount: null,
  host: null,
  leads: null,
  membership: null,
  about: { displayName: 'Green Space', location: null, facets: [] },
});
const legacyAnonymous: LegacyAbout = {
  profile: { displayName: 'Green Space' },
  metrics: [],
  membership: { leadUsers: [], leadOrganizations: [] },
  tags: ['green', 'energy'],
};

describe('About props from the D2 Space document (021 T010)', () => {
  test.each([
    ['reader', reader, legacyReader],
    ['face-only viewer', faceOnly, legacyFaceOnly],
    ['anonymous visitor', anonymous, legacyAnonymous],
  ])('%s: deep-equal to the legacy mapping of the equivalent legacy data', (_, native, legacy) => {
    expect(mapNativeSpaceAbout(native, 'not yet')).toEqual(legacyAboutData(legacy));
  });

  test('why/who come from the core/purpose facet and references from the reference link roles in their order', () => {
    const native = doc({
      about: {
        displayName: 'Green Space',
        location: null,
        facets: [
          { namespace: 'core', name: 'purpose', value: { why: 'Because', who: 'Everyone' } },
          {
            namespace: 'core',
            name: 'link_role.reference',
            value: [
              { id: 'k2', role: 'reference', uri: 'https://b', title: 'B', description: null, sortOrder: 2 },
              { id: 'k1', role: 'reference', uri: 'https://a', title: 'A', description: 'First', sortOrder: 0 },
            ],
          },
          {
            namespace: 'core',
            name: 'link_role.website',
            value: [{ id: 'k3', role: 'website', uri: 'https://c', title: 'C', description: null, sortOrder: 1 }],
          },
          {
            namespace: 'core',
            name: 'link_role.guidelines',
            value: [{ id: 'k4', role: 'guidelines', uri: 'https://d', title: 'D', description: null, sortOrder: 0 }],
          },
        ],
      },
    });
    expect(mapNativeSpaceAbout(native, 'not yet')).toMatchObject({
      why: 'Because',
      who: 'Everyone',
      references: [
        { name: 'A', uri: 'https://a', description: 'First' },
        { name: 'C', uri: 'https://c', description: undefined },
        { name: 'B', uri: 'https://b', description: undefined },
      ],
    });
  });

  test('classifications come from the core/classification sets and their settings (label, visible, order)', () => {
    const set = (id: string, selected: string[], settings?: Record<string, unknown>) => ({
      choiceSet: {
        id,
        namespace: 'core',
        name: 'classification',
        mode: 'closed',
        ...(settings && { settings }),
        values: [
          { id: `${id}-b`, value: 'Beta', description: null, sortOrder: 1, settings: null },
          { id: `${id}-a`, value: 'Alpha', description: null, sortOrder: 0, settings: null },
        ],
      },
      selected,
    });
    const native = doc({
      about: {
        displayName: 'Green Space',
        location: null,
        facets: [
          {
            namespace: 'core',
            name: 'classification',
            value: [
              set('region', ['region-a'], { display_label: 'Region', visible: true, order: 1, selection: 'one' }),
              set('sector', ['sector-b'], { display_label: 'Sector', visible: true, order: 0, selection: 'many' }),
              set('hidden', ['hidden-a'], { display_label: 'Hidden', visible: false, order: 2 }),
              set('unserved', ['unserved-a']),
            ],
          },
        ],
      },
    });
    // A reader sees the shown sets in their order; an editor also the hidden one (legacy groupEntriesForDisplay). A set
    // whose settings are not served yet says so in its label slot.
    expect(nativeClassifications(native, false, 'not yet')).toEqual([
      { id: 'sector', displayLabel: 'Sector', values: ['Beta'], hidden: false },
      { id: 'region', displayLabel: 'Region', values: ['Alpha'], hidden: false },
      { id: 'unserved', displayLabel: 'not yet', values: ['Alpha'], hidden: false },
    ]);
    expect(nativeClassifications(native, true, 'not yet').map(entry => [entry.id, entry.hidden])).toEqual([
      ['sector', false],
      ['region', false],
      ['hidden', true],
      ['unserved', false],
    ]);
  });

  test('sidebar leads: users first, then organizations, as the legacy mapper on legacy lead lists', () => {
    const toLegacy = (profile: LegacyProfile, id: string) => ({ id, profile });
    const leads = reader.leads;
    expect(mapSidebarLeads(actorsOfType(leads, 'user'), actorsOfType(leads, 'organization'))).toEqual(
      mapSidebarLeads(
        [toLegacy(legacyProfile('ann', 'Delft'), 'ann'), toLegacy(legacyProfile('bob'), 'bob')],
        [toLegacy(legacyProfile('org'), 'org')]
      )
    );
  });
});

describe('Community roster rows from D6 (021 T016)', () => {
  test('deep-equal to the legacy role-set mapping; VCs are not on the roster', () => {
    const user = { ...actor('ann', 'user', 'Delft'), skills: ['go'], keywords: ['energy'] };
    const org = {
      ...actor('org', 'organization', null),
      __typename: 'Organization' as const,
      about: { ...actor('org', 'organization', null).about, description: 'An organisation' },
      tags: ['ngo'],
    };
    const vc = { ...actor('vc', 'virtual_contributor', null), skills: [], keywords: [] };
    const native = [
      { id: 'm1', roles: ['lead', 'member'], actor: user },
      { id: 'm2', roles: ['member'], actor: org },
      { id: 'm3', roles: ['member'], actor: vc },
    ];
    const legacy = mapRoleSetToMemberCards(
      [
        {
          id: 'ann',
          roles: [RoleName.Lead, RoleName.Member],
          profile: { ...legacyProfile('ann', 'Delft'), tagsets: [{ tags: ['go'] }, { tags: ['energy'] }] },
        },
      ],
      [
        {
          id: 'org',
          roles: [RoleName.Member],
          profile: { ...legacyProfile('org'), description: 'An organisation', tagsets: [{ tags: ['ngo'] }] },
        },
      ]
    );
    expect(mapNativeMembersToMemberCards(native)).toEqual(legacy);
  });
});
