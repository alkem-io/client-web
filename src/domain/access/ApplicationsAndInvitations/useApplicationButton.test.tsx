import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { AuthorizationPrivilege, CommunityMembershipStatus } from '@/core/apollo/generated/graphql-schema';

// ---- Mocks ----

const useApplicationButtonQueryMock = vi.fn();
const useUserPendingMembershipsQueryMock = vi.fn();
const noopLazyQuery = () => [vi.fn(), { loading: false }];
const noopMutation = () => [vi.fn(), { loading: false }];

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useApplicationButtonQuery: (args: unknown) => useApplicationButtonQueryMock(args),
  useUserPendingMembershipsQuery: (args: unknown) => useUserPendingMembershipsQueryMock(args),
  useCurrentUserFullLazyQuery: () => noopLazyQuery(),
  useJoinRoleSetMutation: () => noopMutation(),
  useSpacePageLazyQuery: () => noopLazyQuery(),
  useSubspacePageLazyQuery: () => noopLazyQuery(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/core/auth/authentication/hooks/useAuthenticationContext', () => ({
  useAuthenticationContext: () => ({ isAuthenticated: true }),
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => vi.fn(),
}));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { id: 'user-1' }, loadingMe: false }),
}));

import useApplicationButton from './useApplicationButton';

type BuildArgs = {
  privileges?: AuthorizationPrivilege[];
  parentMembershipStatus?: CommunityMembershipStatus;
  hasParent?: boolean;
};

const buildQueryData = ({
  privileges = [],
  parentMembershipStatus = CommunityMembershipStatus.NotMember,
  hasParent = true,
}: BuildArgs) => ({
  lookup: {
    space: {
      level: 'L1',
      about: {
        profile: { url: '/subspace', displayName: 'Subspace' },
        membership: {
          roleSetID: 'roleset-1',
          myMembershipStatus: CommunityMembershipStatus.NotMember,
          myPrivileges: privileges,
        },
      },
    },
  },
  parentSpace: hasParent
    ? {
        space: {
          level: 'L0',
          about: {
            profile: { url: '/parent', displayName: 'Parent' },
            membership: {
              myMembershipStatus: parentMembershipStatus,
              myPrivileges: [],
            },
          },
        },
      }
    : undefined,
});

describe('useApplicationButton gate logic', () => {
  beforeEach(() => {
    useApplicationButtonQueryMock.mockReset();
    useUserPendingMembershipsQueryMock.mockReset();
    useUserPendingMembershipsQueryMock.mockReturnValue({ data: undefined, loading: false });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('subspace non-parent-member WITH RolesetEntryRoleApply ⇒ Apply offered', () => {
    useApplicationButtonQueryMock.mockReturnValue({
      data: buildQueryData({
        privileges: [AuthorizationPrivilege.RolesetEntryRoleApply],
        parentMembershipStatus: CommunityMembershipStatus.NotMember,
      }),
      loading: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useApplicationButton({ spaceId: 'space-1', parentSpaceId: 'parent-1' }));

    // Not a parent member, yet the server-granted privilege makes Apply eligible.
    expect(result.current.applicationButtonProps.isParentMember).toBe(false);
    expect(result.current.applicationButtonProps.canApplyToCommunity).toBe(true);
  });

  test('subspace non-parent-member WITHOUT the privilege ⇒ parent-first fallback (Apply not offered)', () => {
    useApplicationButtonQueryMock.mockReturnValue({
      data: buildQueryData({
        privileges: [],
        parentMembershipStatus: CommunityMembershipStatus.NotMember,
      }),
      loading: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useApplicationButton({ spaceId: 'space-1', parentSpaceId: 'parent-1' }));

    expect(result.current.applicationButtonProps.isParentMember).toBe(false);
    expect(result.current.applicationButtonProps.canApplyToCommunity).toBe(false);
  });

  test('subspace non-parent-member WITH RolesetEntryRoleJoin ⇒ Join offered without parent membership', () => {
    useApplicationButtonQueryMock.mockReturnValue({
      data: buildQueryData({
        privileges: [AuthorizationPrivilege.RolesetEntryRoleJoin],
        parentMembershipStatus: CommunityMembershipStatus.NotMember,
      }),
      loading: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useApplicationButton({ spaceId: 'space-1', parentSpaceId: 'parent-1' }));

    expect(result.current.applicationButtonProps.isParentMember).toBe(false);
    expect(result.current.applicationButtonProps.canJoinCommunity).toBe(true);
  });

  test('top-level space (no parent) WITH RolesetEntryRoleApply ⇒ Apply offered (unchanged)', () => {
    useApplicationButtonQueryMock.mockReturnValue({
      data: buildQueryData({
        privileges: [AuthorizationPrivilege.RolesetEntryRoleApply],
        hasParent: false,
      }),
      loading: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useApplicationButton({ spaceId: 'space-1' }));

    expect(result.current.applicationButtonProps.canApplyToCommunity).toBe(true);
  });
});
