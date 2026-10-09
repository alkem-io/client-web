import { describe, expect, it } from 'vitest';
import type { OrganizationSettingsMembershipsQuery } from '@/core/apollo/generated/graphql-schema';
import { RoleName, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import type { MembershipEnrichment } from '../../../../userPages/settings/membership/useMembershipEnrichment';
import { filterMemberships } from '../../../../userPages/settings/membership/userMembershipMapper';
import { collectOrgMembershipSpaceIds, mapOrgMembershipRows } from '../orgMembershipMapper';

const buildData = (): OrganizationSettingsMembershipsQuery => ({
  rolesOrganization: {
    id: 'roles-org-1',
    spaces: [
      {
        id: 'space-a',
        roles: [RoleName.Member],
        displayName: 'Garden Space',
        subspaces: [{ id: 'sub-a-1', displayName: 'Garden Patch', roles: [RoleName.Member], level: SpaceLevel.L1 }],
      },
      {
        id: 'space-b',
        roles: [RoleName.Member, RoleName.Lead],
        displayName: 'Lab',
        subspaces: [],
      },
    ],
  },
});

describe('mapOrgMembershipRows', () => {
  it('yields one row per space and subspace, scoping a subspace row to its own id', () => {
    const rows = mapOrgMembershipRows(buildData(), new Map());

    expect(rows.map(r => r.id)).toEqual(['space-a', 'sub-a-1', 'space-b']);
    expect(rows[0]).toMatchObject({ type: 'Space', spaceId: 'space-a' });
    expect(rows[1]).toMatchObject({ type: 'Subspace', spaceId: 'sub-a-1', displayName: 'Garden Patch' });
  });

  it('reports Lead when the organization holds Lead, Member otherwise', () => {
    const rows = mapOrgMembershipRows(buildData(), new Map());

    expect(rows[0].role).toBe('Member');
    expect(rows[2].role).toBe('Lead');
    const lowercase = buildData();
    lowercase.rolesOrganization.spaces[0].roles = ['member', 'lead'];
    expect(mapOrgMembershipRows(lowercase, new Map())[0].role).toBe('Lead');
  });

  it('falls back to the query data without enrichment and prefers enrichment when present', () => {
    const bare = mapOrgMembershipRows(buildData(), new Map());
    expect(bare[0]).toMatchObject({
      displayName: 'Garden Space',
      spaceUrl: '',
      tagline: undefined,
      bannerUrl: undefined,
    });
    expect(bare[0].leadUsers).toEqual([]);

    const enrichment = new Map<string, MembershipEnrichment>([
      [
        'sub-a-1',
        {
          displayName: 'Garden Patch (rich)',
          tagline: 'Daily plantings',
          bannerUrl: 'https://cdn/patch.jpg',
          spaceUrl: '/space/garden/patch',
          leadUsers: [{ id: 'u1', displayName: 'Ada', profileUrl: '/user/ada' }],
        },
      ],
    ]);
    const enriched = mapOrgMembershipRows(buildData(), enrichment);
    expect(enriched[1]).toMatchObject({
      displayName: 'Garden Patch (rich)',
      tagline: 'Daily plantings',
      bannerUrl: 'https://cdn/patch.jpg',
      spaceUrl: '/space/garden/patch',
    });
    expect(enriched[1].leadUsers).toHaveLength(1);
  });

  it('returns no rows for an undefined payload', () => {
    expect(mapOrgMembershipRows(undefined, new Map())).toEqual([]);
  });
});

describe('collectOrgMembershipSpaceIds', () => {
  it('returns L0 and subspace ids in display order', () => {
    expect(collectOrgMembershipSpaceIds(buildData())).toEqual(['space-a', 'sub-a-1', 'space-b']);
    expect(collectOrgMembershipSpaceIds(undefined)).toEqual([]);
  });
});

describe('filterMemberships over organization rows', () => {
  it('honours the subspaces filter and a case-insensitive search', () => {
    const rows = mapOrgMembershipRows(buildData(), new Map());

    expect(filterMemberships(rows, '', 'subspaces').map(r => r.id)).toEqual(['sub-a-1']);
    expect(filterMemberships(rows, '', 'spaces').map(r => r.id)).toEqual(['space-a', 'space-b']);
    expect(filterMemberships(rows, 'GARDEN', 'all').map(r => r.id)).toEqual(['space-a', 'sub-a-1']);
  });
});
