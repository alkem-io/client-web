import { describe, expect, it } from 'vitest';
import { mapAboutLeads, mapSidebarLeads } from './spacePageDataMapper';

type Leads = NonNullable<Parameters<typeof mapSidebarLeads>[0]>;

const leadUsers: Leads = [
  {
    id: 'bob',
    profile: {
      displayName: 'Bob Builder',
      url: '/user/bob',
      avatar: { uri: 'https://example.org/bob.png' },
      tagline: 'Builds things',
      location: { city: 'Utrecht', country: 'NL' },
      keywords: { tags: ['climate'] },
    },
  },
  {
    id: 'me',
    profile: { displayName: 'Me Myself', url: '/user/me', location: { city: 'Utrecht' } },
  },
];

const leadOrganizations: Leads = [
  { id: 'acme', profile: { displayName: 'Acme', url: '/organization/acme', tagline: 'We make anvils' } },
];

describe('mapSidebarLeads', () => {
  it('sets a preview per lead and reads the item fields from it', () => {
    const leads = mapSidebarLeads(leadUsers, leadOrganizations, 'me');

    expect(leads.map(lead => [lead.type, lead.preview?.type])).toEqual([
      ['person', 'user'],
      ['person', 'user'],
      ['org', 'organization'],
    ]);
    for (const lead of leads) {
      expect(lead.name).toBe(lead.preview?.name);
      expect(lead.avatarUrl).toBe(lead.preview?.avatarUrl);
      expect(lead.href).toBe(lead.preview?.href);
      expect(lead.location).toBe(lead.preview?.locationLabel);
    }
    expect(leads[0].preview).toMatchObject({ tagline: 'Builds things', tags: ['climate'], canMessage: true });
    expect(leads[0].initials).toBe('BB');
    expect(leads[2].preview?.canMessage).toBe(false);
  });

  it('gives the viewer themselves no message action', () => {
    const me = mapSidebarLeads(leadUsers, undefined, 'me').find(lead => lead.id === 'me');
    expect(me?.preview?.canMessage).toBe(false);
  });

  it('shows the city alone without a stray comma', () => {
    const me = mapSidebarLeads(leadUsers, undefined, 'me').find(lead => lead.id === 'me');
    expect(me?.location).toBe('Utrecht');
  });

  it('skips leads without a profile', () => {
    expect(mapSidebarLeads([{ id: 'ghost', profile: null }], undefined, 'me')).toEqual([]);
  });
});

describe('mapAboutLeads', () => {
  it('builds the About lead lists from the same previews as the sidebar', () => {
    const { leadUsers: users, leadOrganizations: orgs } = mapAboutLeads(leadUsers, leadOrganizations, 'me');
    const sidebar = mapSidebarLeads(leadUsers, leadOrganizations, 'me');

    expect([...users, ...orgs].map(lead => lead.preview)).toEqual(sidebar.map(lead => lead.preview));
    expect(users.map(lead => lead.type)).toEqual(['person', 'person']);
    expect(orgs.map(lead => lead.type)).toEqual(['organization']);
    for (const lead of [...users, ...orgs]) {
      expect(lead.name).toBe(lead.preview?.name);
      expect(lead.href).toBe(lead.preview?.href);
      expect(lead.location).toBe(lead.preview?.locationLabel);
    }
  });

  it('skips leads without a profile', () => {
    expect(mapAboutLeads([{ id: 'ghost', profile: null }], undefined, 'me')).toEqual({
      leadUsers: [],
      leadOrganizations: [],
    });
  });
});
