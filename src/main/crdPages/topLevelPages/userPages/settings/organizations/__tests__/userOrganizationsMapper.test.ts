import { describe, expect, it } from 'vitest';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import type { OrgEnrichment } from '../useOrganizationEnrichment';
import { filterOrganizations, mapUserOrganizations } from '../userOrganizationsMapper';

const buildEnrichment = (overrides: Partial<OrgEnrichment> = {}): OrgEnrichment => ({
  id: 'org-1',
  displayName: 'Alkemio Innovation Lab',
  avatarUrl: 'https://cdn/alkemio.png',
  tagline: 'Driving collaborative innovation',
  description: undefined,
  location: 'Amsterdam, Netherlands',
  profileUrl: '/organization/alkemio',
  verified: true,
  associatesCount: 42,
  roleSetId: 'role-set-1',
  myRoles: [RoleName.Admin],
  ...overrides,
});

describe('mapUserOrganizations', () => {
  it('maps each id to a row using the enrichment payload', () => {
    const enrichment = new Map([['org-1', buildEnrichment()]]);
    const rows = mapUserOrganizations(['org-1'], enrichment);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: 'org-1',
      displayName: 'Alkemio Innovation Lab',
      avatarUrl: 'https://cdn/alkemio.png',
      tagline: 'Driving collaborative innovation',
      location: 'Amsterdam, Netherlands',
      role: 'Admin',
      verified: true,
      profileUrl: '/organization/alkemio',
      associatesCount: 42,
      roleSetId: 'role-set-1',
    });
    // color is derived from pickColorFromId — non-empty hex
    expect(rows[0].color).toMatch(/^#/);
  });

  it('falls back to placeholder values when enrichment for an id is missing', () => {
    const rows = mapUserOrganizations(['org-1'], new Map());
    expect(rows[0]).toMatchObject({
      id: 'org-1',
      displayName: '',
      role: 'Associate',
      verified: false,
      profileUrl: '',
      roleSetId: '',
      associatesCount: undefined,
    });
  });

  it('treats users without the Admin role as Associate (default role)', () => {
    const enrichment = new Map([['org-2', buildEnrichment({ id: 'org-2', myRoles: [RoleName.Associate] })]]);
    const rows = mapUserOrganizations(['org-2'], enrichment);
    expect(rows[0].role).toBe('Associate');
  });
});

describe('filterOrganizations', () => {
  const rows = [
    {
      id: 'a',
      displayName: 'Alkemio Innovation Lab',
      color: '#000',
      role: 'Admin' as const,
      verified: true,
      profileUrl: '',
      location: 'Amsterdam, Netherlands',
      roleSetId: '',
    },
    {
      id: 'b',
      displayName: 'Green Future Foundation',
      color: '#000',
      role: 'Associate' as const,
      verified: true,
      profileUrl: '',
      location: 'Berlin, Germany',
      roleSetId: '',
    },
  ];

  it('matches case-insensitive substring on displayName', () => {
    expect(filterOrganizations(rows, 'alkemio').map(r => r.id)).toEqual(['a']);
  });

  it('matches case-insensitive substring on location too', () => {
    expect(filterOrganizations(rows, 'berlin').map(r => r.id)).toEqual(['b']);
  });

  it('returns the entire list when search is empty / whitespace', () => {
    expect(filterOrganizations(rows, '').length).toBe(2);
    expect(filterOrganizations(rows, '   ').length).toBe(2);
  });
});
