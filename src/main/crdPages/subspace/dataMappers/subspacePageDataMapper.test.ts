import { describe, expect, it } from 'vitest';
import { mapSubspaceLeadOrganizations, mapSubspaceLeads, mapSubspaceSidebar } from './subspacePageDataMapper';

const user = {
  id: 'user-1',
  profile: {
    displayName: 'Ada Lovelace',
    avatar: { uri: 'avatar-user.png' },
    url: '/user/ada',
    location: { city: 'London', country: 'UK' },
  },
};

const org = {
  id: 'org-1',
  profile: {
    displayName: 'Acme Org',
    avatar: { uri: 'avatar-org.png' },
    url: '/organization/acme',
    location: { city: 'Amsterdam', country: 'NL' },
  },
};

describe('mapSubspaceLeads', () => {
  it('maps lead users as person-typed entries', () => {
    expect(mapSubspaceLeads([user])).toEqual([
      {
        id: 'user-1',
        name: 'Ada Lovelace',
        avatarUrl: 'avatar-user.png',
        initials: 'AL',
        href: '/user/ada',
        location: 'London, UK',
        type: 'person',
      },
    ]);
  });
});

describe('mapSubspaceLeadOrganizations', () => {
  it('maps lead organisations as org-typed entries', () => {
    expect(mapSubspaceLeadOrganizations([org])).toEqual([
      {
        id: 'org-1',
        name: 'Acme Org',
        avatarUrl: 'avatar-org.png',
        initials: 'AO',
        href: '/organization/acme',
        location: 'Amsterdam, NL',
        type: 'org',
      },
    ]);
  });
});

describe('mapSubspacesidebar lead organisations (issue #9864)', () => {
  it('includes lead organisations alongside lead users in the sidebar leads list', () => {
    const { leads } = mapSubspaceSidebar({
      description: 'A subspace',
      leadUsers: [user],
      leadOrganizations: [org],
      virtualContributor: undefined,
    });

    expect(leads).toHaveLength(2);
    expect(leads.map(l => l.type)).toEqual(['person', 'org']);
    expect(leads.find(l => l.type === 'org')?.name).toBe('Acme Org');
  });

  it('shows the lead organisation even when there are no lead users', () => {
    const { leads } = mapSubspaceSidebar({
      description: 'A subspace',
      leadUsers: [],
      leadOrganizations: [org],
      virtualContributor: undefined,
    });

    expect(leads).toEqual([
      {
        id: 'org-1',
        name: 'Acme Org',
        avatarUrl: 'avatar-org.png',
        initials: 'AO',
        href: '/organization/acme',
        location: 'Amsterdam, NL',
        type: 'org',
      },
    ]);
  });
});
