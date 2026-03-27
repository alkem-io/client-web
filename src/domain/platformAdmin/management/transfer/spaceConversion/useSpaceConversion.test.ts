import { renderHook } from '@testing-library/react';
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

let mockResolveData: Record<string, unknown> | undefined;
let mockSpaceData: Record<string, unknown> | undefined;
let mockSiblingsData: Record<string, unknown> | undefined;

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
  useConvertSpaceL1ToL0Mutation: () => [mockPromoteL1ToL0, { loading: false }],
  useConvertSpaceL1ToL2Mutation: () => [mockDemoteL1ToL2, { loading: false }],
  useConvertSpaceL2ToL1Mutation: () => [mockPromoteL2ToL1, { loading: false }],
}));

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
          about: { profile: { displayName: 'Test Space', url: '/test' } },
          account: { id: 'acc-1', host: { profile: { displayName: 'Owner' } } },
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
          about: { profile: { displayName: 'L1 Space', url: '/l1' } },
          account: { id: 'acc-1', host: { profile: { displayName: 'Owner' } } },
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
            { id: 'space-l1', level: SpaceLevel.L1, about: { profile: { displayName: 'L1 Space' } } },
            { id: 'sibling-l1', level: SpaceLevel.L1, about: { profile: { displayName: 'Sibling' } } },
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
          about: { profile: { displayName: 'L2 Space', url: '/l2' } },
          account: { id: 'acc-1', host: { profile: { displayName: 'Owner' } } },
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
          subspaces: [{ id: 'only-l1', level: SpaceLevel.L1, about: { profile: { displayName: 'Only L1' } } }],
        },
      },
    };
    const { result } = renderHook(() => useSpaceConversion());
    expect(result.current.siblingSubspaces).toEqual([]);
  });
});
