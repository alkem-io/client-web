import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleName, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { filterMemberships, type MembershipRow, mapUserMembershipData } from '../userMembershipMapper';

// ─── Apollo hook mocks ────────────────────────────────────────────────────

const mockUpdateUserSettings = vi.fn();
const mockFetchSpaceDetails = vi.fn();
const mockRemoveRoleFromUser = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateUserSettingsMutation: () => [mockUpdateUserSettings, { loading: false }],
  useSpaceContributionDetailsLazyQuery: () => [mockFetchSpaceDetails],
  useRemoveRoleFromUserMutation: () => [mockRemoveRoleFromUser, { loading: false }],
}));

import useUserMembershipTabData from '../useUserMembershipTabData';

// ─── Lifecycle ────────────────────────────────────────────────────────────

beforeEach(() => {
  mockUpdateUserSettings.mockReset().mockResolvedValue({ data: {} });
  mockFetchSpaceDetails
    .mockReset()
    .mockResolvedValue({ data: { lookup: { space: { about: { membership: { roleSetID: 'role-set-1' } } } } } });
  mockRemoveRoleFromUser.mockReset().mockResolvedValue({ data: {} });
});

afterEach(() => vi.useRealTimers());

// ─── Mapper tests ────────────────────────────────────────────────────────

const fakeT = ((key: string, options?: { id?: string }) => (options?.id ? `${key}:${options.id}` : key)) as never;

const buildContributions = () => ({
  rolesUser: {
    id: 'roles-1',
    spaces: [
      {
        id: 'space-a',
        roles: [RoleName.Member],
        displayName: 'Garden Space',
        subspaces: [
          { id: 'sub-a-1', level: SpaceLevel.L1, roles: [RoleName.Lead] },
          { id: 'sub-a-2', level: SpaceLevel.L2, roles: [RoleName.Admin] },
        ],
      },
      {
        id: 'space-b',
        roles: [RoleName.Admin],
        displayName: 'Admin Lab',
        subspaces: [],
      },
    ],
  },
});

const buildSettings = (overrides: Partial<{ spaceID: string; autoRedirect: boolean }> = {}) => ({
  lookup: {
    user: {
      settings: {
        homeSpace: {
          spaceID: overrides.spaceID,
          autoRedirect: overrides.autoRedirect ?? false,
        },
      },
    },
  },
});

describe('mapUserMembershipData', () => {
  it('flattens L0 spaces + their subspaces into rows with type/role assignment', () => {
    const result = mapUserMembershipData(
      buildContributions() as never,
      buildSettings() as never,
      undefined,
      new Map(),
      fakeT
    );

    expect(result.rows).toHaveLength(4);
    expect(result.rows[0]).toMatchObject({ id: 'space-a', type: 'Space', role: 'Member' });
    // Subspaces' `spaceId` is their own id — each subspace has its own
    // role-set, so Leave is scoped to the subspace, not the L0 parent.
    expect(result.rows[1]).toMatchObject({ id: 'sub-a-1', type: 'Subspace', role: 'Lead', spaceId: 'sub-a-1' });
    expect(result.rows[2]).toMatchObject({ id: 'sub-a-2', type: 'Subspace', role: 'Admin', spaceId: 'sub-a-2' });
    expect(result.rows[3]).toMatchObject({ id: 'space-b', type: 'Space', role: 'Admin' });
  });

  it('enriches rows with banner + tagline + url + leadUsers from the per-row enrichment map', () => {
    const enrichment = new Map([
      [
        'space-a',
        {
          displayName: 'Garden Space (rich)',
          tagline: 'Cultivating ideas',
          bannerUrl: 'https://cdn/garden-card.jpg',
          spaceUrl: '/space/garden',
          leadUsers: [
            { id: 'u1', displayName: 'Ada Lovelace', avatarUrl: 'https://cdn/ada.png', profileUrl: '/user/ada' },
            { id: 'u2', displayName: 'Grace Hopper', profileUrl: '/user/grace' },
          ],
        },
      ],
      [
        'sub-a-1',
        {
          displayName: 'Garden Patch',
          tagline: 'Daily plantings',
          spaceUrl: '/space/garden/sub-a-1',
          leadUsers: [],
        },
      ],
    ]);

    const result = mapUserMembershipData(
      buildContributions() as never,
      buildSettings() as never,
      undefined,
      enrichment,
      fakeT
    );

    expect(result.rows[0]).toMatchObject({
      id: 'space-a',
      displayName: 'Garden Space (rich)',
      tagline: 'Cultivating ideas',
      bannerUrl: 'https://cdn/garden-card.jpg',
      spaceUrl: '/space/garden',
    });
    expect(result.rows[0].leadUsers).toHaveLength(2);
    expect(result.rows[0].leadUsers[0]).toMatchObject({ id: 'u1', displayName: 'Ada Lovelace' });
    expect(result.rows[1]).toMatchObject({
      id: 'sub-a-1',
      displayName: 'Garden Patch',
      tagline: 'Daily plantings',
      spaceUrl: '/space/garden/sub-a-1',
    });
    expect(result.rows[1].leadUsers).toHaveLength(0);
  });

  it('falls back to contribution-only data (no banner/tagline) when enrichment map is empty', () => {
    const result = mapUserMembershipData(
      buildContributions() as never,
      buildSettings() as never,
      undefined,
      new Map(),
      fakeT
    );
    expect(result.rows[0]).toMatchObject({
      id: 'space-a',
      displayName: 'Garden Space',
      tagline: undefined,
      bannerUrl: undefined,
    });
    expect(result.rows[0].leadUsers).toEqual([]);
  });

  it('exposes home-space options + canEnableAutoRedirect derived from selectedSpaceId', () => {
    const noHome = mapUserMembershipData(
      buildContributions() as never,
      buildSettings() as never,
      undefined,
      new Map(),
      fakeT
    );
    expect(noHome.homeSpace.canEnableAutoRedirect).toBe(false);

    const withHome = mapUserMembershipData(
      buildContributions() as never,
      buildSettings({ spaceID: 'space-a', autoRedirect: true }) as never,
      undefined,
      new Map(),
      fakeT
    );
    expect(withHome.homeSpace.selectedSpaceId).toBe('space-a');
    expect(withHome.homeSpace.canEnableAutoRedirect).toBe(true);
    expect(withHome.homeSpace.autoRedirect).toBe(true);
    expect(withHome.homeSpace.options).toHaveLength(2);
  });
});

describe('filterMemberships', () => {
  const baseRow = { color: '#000', spaceUrl: '', leadUsers: [] };
  const rows: MembershipRow[] = [
    { ...baseRow, id: 'a', spaceId: 'a', displayName: 'Garden Space', type: 'Space', role: 'Member' },
    { ...baseRow, id: 'b', spaceId: 'b', displayName: 'Admin Lab', type: 'Space', role: 'Admin' },
    { ...baseRow, id: 'c', spaceId: 'a', displayName: 'Garden Sub', type: 'Subspace', role: 'Lead' },
  ];

  it('search is case-insensitive substring match', () => {
    const r = filterMemberships(rows, 'garden', 'all');
    expect(r.map(x => x.id)).toEqual(['a', 'c']);
  });

  it('type filter narrows to Spaces or Subspaces', () => {
    expect(filterMemberships(rows, '', 'spaces')).toHaveLength(2);
    expect(filterMemberships(rows, '', 'subspaces')).toHaveLength(1);
  });

  it('returns the entire matching set (no pagination — the grid renders them all)', () => {
    const big: MembershipRow[] = Array.from({ length: 25 }).map((_, i) => ({
      ...rows[0],
      id: `r-${i}`,
      spaceId: `r-${i}`,
      displayName: `Row ${i}`,
    }));
    expect(filterMemberships(big, '', 'all')).toHaveLength(25);
  });
});

// ─── Hook tests ──────────────────────────────────────────────────────────

describe('useUserMembershipTabData — search / filter / clear', () => {
  it('search and filter changes update independently', () => {
    const { result } = renderHook(() => useUserMembershipTabData('user-1'));

    act(() => {
      result.current.onSearchChange('garden');
    });
    expect(result.current.search).toBe('garden');

    act(() => {
      result.current.onFilterChange('subspaces');
    });
    expect(result.current.filter).toBe('subspaces');
    expect(result.current.search).toBe('garden');
  });

  it('onClearFilters resets both search and filter to defaults', () => {
    const { result } = renderHook(() => useUserMembershipTabData('user-1'));
    act(() => {
      result.current.onSearchChange('garden');
      result.current.onFilterChange('spaces');
    });
    act(() => {
      result.current.onClearFilters();
    });
    expect(result.current.search).toBe('');
    expect(result.current.filter).toBe('all');
  });
});

describe('useUserMembershipTabData — Home Space mutations', () => {
  it('selecting a Home Space patches via updateUserSettings and preserves autoRedirect', async () => {
    const { result } = renderHook(() => useUserMembershipTabData('user-1'));
    await act(async () => {
      await result.current.onSelectHomeSpace('space-a', true);
    });
    expect(mockUpdateUserSettings).toHaveBeenCalledWith({
      variables: {
        settingsData: {
          userID: 'user-1',
          settings: { homeSpace: { spaceID: 'space-a', autoRedirect: true } },
        },
      },
    });
  });

  it('clearing the Home Space auto-disables autoRedirect (parity with MUI)', async () => {
    const { result } = renderHook(() => useUserMembershipTabData('user-1'));
    await act(async () => {
      await result.current.onSelectHomeSpace(null, true);
    });
    expect(mockUpdateUserSettings).toHaveBeenCalledWith({
      variables: {
        settingsData: {
          userID: 'user-1',
          settings: { homeSpace: { spaceID: null, autoRedirect: false } },
        },
      },
    });
  });

  it('toggling autoRedirect patches only that field', async () => {
    const { result } = renderHook(() => useUserMembershipTabData('user-1'));
    await act(async () => {
      await result.current.onToggleAutoRedirect(true);
    });
    expect(mockUpdateUserSettings).toHaveBeenCalledWith({
      variables: {
        settingsData: { userID: 'user-1', settings: { homeSpace: { autoRedirect: true } } },
      },
    });
  });
});

describe('useUserMembershipTabData — Leave confirmation flow (Rule #9)', () => {
  it('cancel does NOT fire removeRoleFromUser', () => {
    const { result } = renderHook(() => useUserMembershipTabData('user-1'));
    act(() => {
      result.current.onRequestLeave({ membershipId: 'm1', spaceId: 'space-a', displayName: 'Garden' });
    });
    expect(result.current.pendingLeave?.spaceId).toBe('space-a');
    act(() => {
      result.current.onCancelLeave();
    });
    expect(result.current.pendingLeave).toBeNull();
    expect(mockRemoveRoleFromUser).not.toHaveBeenCalled();
  });

  it('confirm lazy-fetches the role-set then fires removeRoleFromUser with role=Member', async () => {
    const refetch = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useUserMembershipTabData('user-1', refetch));
    act(() => {
      result.current.onRequestLeave({ membershipId: 'm1', spaceId: 'space-a', displayName: 'Garden' });
    });
    await act(async () => {
      await result.current.onConfirmLeave();
    });
    expect(mockFetchSpaceDetails).toHaveBeenCalledWith({ variables: { spaceId: 'space-a' } });
    expect(mockRemoveRoleFromUser).toHaveBeenCalledWith({
      variables: { contributorId: 'user-1', roleSetId: 'role-set-1', role: RoleName.Member },
      awaitRefetchQueries: true,
    });
    expect(refetch).toHaveBeenCalled();
    expect(result.current.pendingLeave).toBeNull();
  });
});
