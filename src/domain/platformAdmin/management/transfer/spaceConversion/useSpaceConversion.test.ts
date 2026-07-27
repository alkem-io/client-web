import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { SpaceLevel, UrlResolverResultState, UrlType } from '@/core/apollo/generated/graphql-schema';
import useSpaceConversion from './useSpaceConversion';

const mockNotify = vi.fn();

vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => mockNotify,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockPromoteL1ToL0 = vi.fn().mockResolvedValue({ data: {} });
const mockDemoteL1ToL2 = vi.fn().mockResolvedValue({ data: {} });
const mockPromoteL2ToL1 = vi.fn().mockResolvedValue({ data: {} });
const mockMoveL1ToL0 = vi.fn().mockResolvedValue({
  data: { moveSpaceL1ToSpaceL0: { id: 'new-id-l1l0', about: { profile: { url: '/spaces/new-l1l0' } } } },
});
const mockMoveL1ToL2 = vi.fn().mockResolvedValue({
  data: { moveSpaceL1ToSpaceL2: { id: 'new-id-l1l2', about: { profile: { url: '/spaces/new-l1l2' } } } },
});
const mockMoveL2ToL1 = vi.fn().mockResolvedValue({
  data: {
    moveSpaceL2ToSpaceL1: {
      id: 'new-id-l2l1',
      level: SpaceLevel.L2,
      about: { profile: { url: '/spaces/new-l2l1' } },
    },
  },
});

let mockResolveData: Record<string, unknown> | undefined;
let mockSpaceData: Record<string, unknown> | undefined;
let mockSiblingsData: Record<string, unknown> | undefined;
let mockTargetL0Data: Record<string, unknown> | undefined;
let mockTargetL1Data: Record<string, unknown> | undefined;

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSpaceConversionUrlResolveQuery: () => ({
    data: mockResolveData,
    loading: false,
  }),
  useSpaceConversionLookupQuery: () => ({
    data: mockSpaceData,
    loading: false,
  }),
  useSpaceConversionSiblingSubspacesQuery: () => ({
    data: mockSiblingsData,
    loading: false,
  }),
  useSpaceMoveTargetL0SpacesQuery: () => ({
    data: mockTargetL0Data,
    loading: false,
  }),
  useSpaceMoveTargetL1SubspacesQuery: () => ({
    data: mockTargetL1Data,
    loading: false,
  }),
  useConvertSpaceL1ToL0Mutation: () => [mockPromoteL1ToL0, { loading: false }],
  useConvertSpaceL1ToL2Mutation: () => [mockDemoteL1ToL2, { loading: false }],
  useConvertSpaceL2ToL1Mutation: () => [mockPromoteL2ToL1, { loading: false }],
  useMoveSpaceL1ToL0Mutation: () => [mockMoveL1ToL0, { loading: false }],
  useMoveSpaceL1ToL2Mutation: () => [mockMoveL1ToL2, { loading: false }],
  useMoveSpaceL2ToL1Mutation: () => [mockMoveL2ToL1, { loading: false }],
}));

// Resolve data helpers
const resolveL1 = (id = 'space-l1', levelZeroSpaceID = 'space-l0') => ({
  urlResolver: {
    state: UrlResolverResultState.Resolved,
    type: UrlType.Space,
    space: { id, level: SpaceLevel.L1, levelZeroSpaceID },
  },
});

const resolveL2 = (id = 'space-l2', levelZeroSpaceID = 'space-l0') => ({
  urlResolver: {
    state: UrlResolverResultState.Resolved,
    type: UrlType.Space,
    space: { id, level: SpaceLevel.L2, levelZeroSpaceID },
  },
});

const spaceDataFor = (id: string, level: SpaceLevel) => ({
  lookup: {
    space: {
      id,
      level,
      about: { id: 'about-1', profile: { id: 'prof-1', displayName: 'My Space', url: `/${id}` } },
      account: { id: 'acc-1', host: { id: 'host-1', profile: { id: 'host-prof', displayName: 'Owner' } } },
      community: {
        roleSet: {
          memberUsers: [],
          leadUsers: [],
          memberOrganizations: [],
          leadOrganizations: [],
          virtualContributorsInRole: [],
        },
      },
    },
  },
});

const targetL0DataWith = (spaces: { id: string; displayName: string }[]) => ({
  spacesPaginated: {
    spaces: spaces.map(s => ({
      id: s.id,
      about: { id: `about-${s.id}`, profile: { id: `prof-${s.id}`, displayName: s.displayName } },
    })),
  },
});

const targetL1DataWith = (subspaces: { id: string; displayName: string }[]) => ({
  lookup: {
    space: {
      id: 'chosen-l0',
      subspaces: subspaces.map(s => ({
        id: s.id,
        about: { id: `about-${s.id}`, profile: { id: `prof-${s.id}`, displayName: s.displayName } },
      })),
    },
  },
});

describe('useSpaceConversion', () => {
  test('returns no error when URL is not yet resolved (initial state)', () => {
    mockResolveData = undefined;
    const { result } = renderHook(() => useSpaceConversion());
    expect(result.current.error).toBeUndefined();
    expect(result.current.resolvedLevel).toBeUndefined();
  });

  test('returns urlNotFound error when resolver reports NotFound', () => {
    mockResolveData = {
      urlResolver: {
        state: UrlResolverResultState.NotFound,
        type: null,
        space: null,
      },
    };
    const { result } = renderHook(() => useSpaceConversion());
    expect(result.current.error).toBe('pages.admin.spaceConversion.urlNotFound');
  });

  test('returns urlNotSpace error when resolved entity is not a space', () => {
    mockResolveData = {
      urlResolver: {
        state: UrlResolverResultState.Resolved,
        type: UrlType.User,
        space: null,
      },
    };
    const { result } = renderHook(() => useSpaceConversion());
    expect(result.current.error).toBe('pages.admin.spaceConversion.urlNotSpace');
  });

  test('L0 space has no applicable conversions', () => {
    mockResolveData = {
      urlResolver: {
        state: UrlResolverResultState.Resolved,
        type: UrlType.Space,
        space: { id: 'space-1', level: SpaceLevel.L0, levelZeroSpaceID: 'space-1' },
      },
    };
    mockSpaceData = {
      lookup: {
        space: {
          id: 'space-1',
          level: SpaceLevel.L0,
          about: { id: 'about-1', profile: { id: 'prof-1', displayName: 'Test Space', url: '/test' } },
          account: { id: 'acc-1', host: { id: 'host-1', profile: { id: 'hp', displayName: 'Owner' } } },
          community: {
            roleSet: {
              memberUsers: [],
              leadUsers: [],
              memberOrganizations: [],
              leadOrganizations: [],
              virtualContributorsInRole: [],
            },
          },
        },
      },
    };
    const { result } = renderHook(() => useSpaceConversion());
    expect(result.current.resolvedLevel).toBe(SpaceLevel.L0);
    expect(result.current.error).toBeUndefined();
  });

  test('L1 space exposes promote and demote operations', () => {
    mockResolveData = {
      urlResolver: {
        state: UrlResolverResultState.Resolved,
        type: UrlType.Space,
        space: { id: 'space-l1', level: SpaceLevel.L1, levelZeroSpaceID: 'space-l0' },
      },
    };
    mockSpaceData = {
      lookup: {
        space: {
          id: 'space-l1',
          level: SpaceLevel.L1,
          about: { id: 'about-1', profile: { id: 'prof-1', displayName: 'L1 Space', url: '/l1' } },
          account: { id: 'acc-1', host: { id: 'host-1', profile: { id: 'hp', displayName: 'Owner' } } },
          community: {
            roleSet: {
              memberUsers: [{ id: 'u1' }, { id: 'u2' }],
              leadUsers: [{ id: 'u1' }],
              memberOrganizations: [{ id: 'o1' }],
              leadOrganizations: [],
              virtualContributorsInRole: [],
            },
          },
        },
      },
    };
    mockSiblingsData = {
      lookup: {
        space: {
          id: 'space-l0',
          subspaces: [
            {
              id: 'space-l1',
              level: SpaceLevel.L1,
              about: { id: 'a1', profile: { id: 'p1', displayName: 'L1 Space' } },
            },
            {
              id: 'sibling-l1',
              level: SpaceLevel.L1,
              about: { id: 'a2', profile: { id: 'p2', displayName: 'Sibling' } },
            },
          ],
        },
      },
    };
    const { result } = renderHook(() => useSpaceConversion());
    expect(result.current.resolvedLevel).toBe(SpaceLevel.L1);
    // Sibling picker should exclude the source space
    expect(result.current.siblingSubspaces).toEqual([{ id: 'sibling-l1', name: 'Sibling' }]);
    // Community counts for L1→L2 warning
    expect(result.current.communityCounts).toEqual({
      memberUsers: 2,
      leadUsers: 1,
      memberOrganizations: 1,
      leadOrganizations: 0,
      virtualContributors: 0,
    });
  });

  test('L2 space exposes only promote-to-L1 operation', () => {
    mockResolveData = {
      urlResolver: {
        state: UrlResolverResultState.Resolved,
        type: UrlType.Space,
        space: { id: 'space-l2', level: SpaceLevel.L2, levelZeroSpaceID: 'space-l0' },
      },
    };
    mockSpaceData = {
      lookup: {
        space: {
          id: 'space-l2',
          level: SpaceLevel.L2,
          about: { id: 'about-1', profile: { id: 'prof-1', displayName: 'L2 Space', url: '/l2' } },
          account: { id: 'acc-1', host: { id: 'host-1', profile: { id: 'hp', displayName: 'Owner' } } },
          community: {
            roleSet: {
              memberUsers: [],
              leadUsers: [],
              memberOrganizations: [],
              leadOrganizations: [],
              virtualContributorsInRole: [],
            },
          },
        },
      },
    };
    mockSiblingsData = undefined;
    const { result } = renderHook(() => useSpaceConversion());
    expect(result.current.resolvedLevel).toBe(SpaceLevel.L2);
    expect(result.current.siblingSubspaces).toEqual([]);
  });

  test('empty sibling list when no other L1 subspaces exist', () => {
    mockResolveData = {
      urlResolver: {
        state: UrlResolverResultState.Resolved,
        type: UrlType.Space,
        space: { id: 'only-l1', level: SpaceLevel.L1, levelZeroSpaceID: 'space-l0' },
      },
    };
    mockSiblingsData = {
      lookup: {
        space: {
          id: 'space-l0',
          subspaces: [
            { id: 'only-l1', level: SpaceLevel.L1, about: { id: 'a1', profile: { id: 'p1', displayName: 'Only L1' } } },
          ],
        },
      },
    };
    const { result } = renderHook(() => useSpaceConversion());
    expect(result.current.siblingSubspaces).toEqual([]);
  });

  // ---- Move handler tests (T004) ----

  describe('moveL1ToL0', () => {
    test('calls mutation with exact variables including autoInvite and invitationMessage', async () => {
      mockResolveData = resolveL1('l1-id', 'l0-id');
      mockSpaceData = spaceDataFor('l1-id', SpaceLevel.L1);
      mockTargetL0Data = targetL0DataWith([{ id: 'other-l0', displayName: 'Other L0' }]);

      const { result } = renderHook(() => useSpaceConversion());
      await act(async () => {
        await result.current.moveL1ToL0('target-l0-id', true, 'Welcome!');
      });

      expect(mockMoveL1ToL0).toHaveBeenCalledWith({
        variables: {
          spaceL1ID: 'l1-id',
          targetSpaceL0ID: 'target-l0-id',
          autoInvite: true,
          invitationMessage: 'Welcome!',
        },
      });
      expect(result.current.movedSpaceUrl).toBe('/spaces/new-l1l0');
    });

    test('L1 source: L0 picker excludes its own L0 (current parent) — R-6', () => {
      mockResolveData = resolveL1('l1-id', 'l0-own');
      mockSpaceData = spaceDataFor('l1-id', SpaceLevel.L1);
      mockTargetL0Data = targetL0DataWith([
        { id: 'l0-own', displayName: 'Own L0' },
        { id: 'other-l0', displayName: 'Other L0' },
      ]);

      const { result } = renderHook(() => useSpaceConversion());
      // targetL0ExcludeIds must include own L0
      expect(result.current.targetL0ExcludeIds).toContain('l0-own');
    });
  });

  describe('moveL2ToL1', () => {
    test('calls mutation with exact variables', async () => {
      mockResolveData = resolveL2('l2-id', 'l0-own');
      mockSpaceData = spaceDataFor('l2-id', SpaceLevel.L2);
      mockTargetL0Data = targetL0DataWith([{ id: 'other-l0', displayName: 'Other L0' }]);

      const { result } = renderHook(() => useSpaceConversion());
      await act(async () => {
        await result.current.moveL2ToL1('target-l1-id', false, undefined);
      });

      expect(mockMoveL2ToL1).toHaveBeenCalledWith({
        variables: {
          spaceL2ID: 'l2-id',
          targetSpaceL1ID: 'target-l1-id',
          autoInvite: false,
          invitationMessage: undefined,
        },
      });
      expect(result.current.movedSpaceUrl).toBe('/spaces/new-l2l1');
    });

    test('L2 source: L0 picker excludes own L0 (levelZeroSpaceId) — R-6', () => {
      mockResolveData = resolveL2('l2-id', 'l0-own');
      mockSpaceData = spaceDataFor('l2-id', SpaceLevel.L2);
      mockTargetL0Data = targetL0DataWith([
        { id: 'l0-own', displayName: 'Own L0' },
        { id: 'other-l0', displayName: 'Other L0' },
      ]);

      const { result } = renderHook(() => useSpaceConversion());
      expect(result.current.targetL0ExcludeIds).toContain('l0-own');
    });
  });

  describe('moveL1ToL2', () => {
    test('calls mutation with exact variables', async () => {
      mockResolveData = resolveL1('l1-id', 'l0-own');
      mockSpaceData = spaceDataFor('l1-id', SpaceLevel.L1);
      mockTargetL0Data = targetL0DataWith([{ id: 'other-l0', displayName: 'Other L0' }]);

      const { result } = renderHook(() => useSpaceConversion());
      await act(async () => {
        await result.current.moveL1ToL2('target-l1-id', true, 'Hi');
      });

      expect(mockMoveL1ToL2).toHaveBeenCalledWith({
        variables: {
          spaceL1ID: 'l1-id',
          targetSpaceL1ID: 'target-l1-id',
          autoInvite: true,
          invitationMessage: 'Hi',
        },
      });
      expect(result.current.movedSpaceUrl).toBe('/spaces/new-l1l2');
    });

    test('L1→L2: L0 picker excludes own L0 (cross-L0 only) — R-6', () => {
      mockResolveData = resolveL1('l1-id', 'l0-own');
      mockSpaceData = spaceDataFor('l1-id', SpaceLevel.L1);
      mockTargetL0Data = targetL0DataWith([
        { id: 'l0-own', displayName: 'Own L0' },
        { id: 'other-l0', displayName: 'Other L0' },
      ]);

      const { result } = renderHook(() => useSpaceConversion());
      expect(result.current.targetL0ExcludeIds).toContain('l0-own');
    });
  });

  describe('targetL1Subspaces — lazy load after L0 selected', () => {
    test('targetL1Subspaces is empty before an L0 is chosen', () => {
      mockResolveData = resolveL2('l2-id', 'l0-own');
      mockSpaceData = spaceDataFor('l2-id', SpaceLevel.L2);
      mockTargetL1Data = undefined;

      const { result } = renderHook(() => useSpaceConversion());
      expect(result.current.selectedTargetL0Id).toBe('');
      expect(result.current.targetL1Subspaces).toEqual([]);
    });

    test('targetL1Subspaces populated after setSelectedTargetL0Id', () => {
      mockResolveData = resolveL2('l2-id', 'l0-own');
      mockSpaceData = spaceDataFor('l2-id', SpaceLevel.L2);
      mockTargetL1Data = targetL1DataWith([
        { id: 'l1-a', displayName: 'L1 Alpha' },
        { id: 'l1-b', displayName: 'L1 Beta' },
      ]);

      const { result } = renderHook(() => useSpaceConversion());
      act(() => {
        result.current.setSelectedTargetL0Id('chosen-l0');
      });
      expect(result.current.targetL1Subspaces).toEqual([
        { id: 'l1-a', displayName: 'L1 Alpha' },
        { id: 'l1-b', displayName: 'L1 Beta' },
      ]);
    });
  });

  describe('error surface propagated', () => {
    test('move error is surfaced via notify', async () => {
      const errorMsg = 'Server error: same-L0 lateral not supported';
      mockMoveL2ToL1.mockRejectedValueOnce(new Error(errorMsg));
      mockResolveData = resolveL2('l2-id', 'l0-own');
      mockSpaceData = spaceDataFor('l2-id', SpaceLevel.L2);

      const { result } = renderHook(() => useSpaceConversion());
      await act(async () => {
        try {
          await result.current.moveL2ToL1('target-l1-id');
        } catch {
          // expected to throw
        }
      });
      expect(mockNotify).toHaveBeenCalledWith(errorMsg, 'error');
    });
  });
});
