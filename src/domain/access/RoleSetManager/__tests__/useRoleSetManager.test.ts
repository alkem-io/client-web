import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthorizationPrivilege, RoleName } from '@/core/apollo/generated/graphql-schema';

// spec-clientweb-1 / sec-client-web-2: the holder-list read (`RoleSetRoleAssignment`)
// must be authorized by `PLATFORM_ROLE_HOLDERS_READ` / `FEATURE_ROLE_HOLDERS_READ`
// (FR-032/A20/A20b) — not gated on plain `READ`, which none of the 13 target
// roles' assigners hold. These tests drive `useRoleSetManager` directly against
// mocked Apollo hooks so the real `canReadRoleSet` / `holdersUnavailable`
// derivations are what's under test, not a wholesale hook mock.

const useRoleSetAuthorizationQueryMock = vi.fn();
const useRoleSetRoleAssignmentQueryMock = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useRoleSetAuthorizationQuery: (args: unknown) => useRoleSetAuthorizationQueryMock(args),
  useRoleSetRoleAssignmentQuery: (args: unknown) => useRoleSetRoleAssignmentQueryMock(args),
}));

vi.mock('../RolesAssignment/useRoleSetManagerRolesAssignment', () => ({
  default: () => ({
    assignRoleToUser: vi.fn(),
    removeRoleFromUser: vi.fn(),
    assignPlatformRoleToUser: vi.fn(),
    removePlatformRoleFromUser: vi.fn(),
    assignPlatformRoleToOrganization: vi.fn(),
    removePlatformRoleFromOrganization: vi.fn(),
    assignRoleToOrganization: vi.fn(),
    removeRoleFromOrganization: vi.fn(),
    assignRoleToVirtualContributor: vi.fn(),
    removeRoleFromVirtualContributor: vi.fn(),
    loading: false,
  }),
}));

import useRoleSetManager from '../useRoleSetManager';

const roleSetId = 'rs1';
const relevantRoles = [RoleName.PlatformRolesAdmin];

const authorizationResult = (
  roleSetPrivileges: AuthorizationPrivilege[],
  platformPrivileges: AuthorizationPrivilege[] = [AuthorizationPrivilege.ReadUsers]
) => ({
  data: {
    platform: { authorization: { myPrivileges: platformPrivileges } },
    lookup: {
      roleSet: {
        id: roleSetId,
        authorization: { id: 'auth1', myPrivileges: roleSetPrivileges },
        roleNames: relevantRoles,
      },
    },
  },
  loading: false,
});

const emptyAssignmentResult = { data: undefined, loading: false, error: undefined, refetch: vi.fn() };

beforeEach(() => {
  vi.clearAllMocks();
  useRoleSetRoleAssignmentQueryMock.mockReturnValue(emptyAssignmentResult);
});

describe('useRoleSetManager — holder-list read gating (FR-032/A20/A20b)', () => {
  test('does not skip the holder-list query for PLATFORM_ROLE_HOLDERS_READ without plain READ', () => {
    useRoleSetAuthorizationQueryMock.mockReturnValue(
      authorizationResult([AuthorizationPrivilege.GrantGlobalAdmins, AuthorizationPrivilege.PlatformRoleHoldersRead])
    );

    renderHook(() => useRoleSetManager({ roleSetId, relevantRoles, fetchContributors: true }));

    expect(useRoleSetRoleAssignmentQueryMock).toHaveBeenCalledWith(expect.objectContaining({ skip: false }));
  });

  test('does not skip the holder-list query for FEATURE_ROLE_HOLDERS_READ without plain READ', () => {
    useRoleSetAuthorizationQueryMock.mockReturnValue(
      authorizationResult([AuthorizationPrivilege.FeatureRoleAssign, AuthorizationPrivilege.FeatureRoleHoldersRead])
    );

    renderHook(() => useRoleSetManager({ roleSetId, relevantRoles, fetchContributors: true }));

    expect(useRoleSetRoleAssignmentQueryMock).toHaveBeenCalledWith(expect.objectContaining({ skip: false }));
  });

  test('still honours legacy plain READ as an additive admitter', () => {
    useRoleSetAuthorizationQueryMock.mockReturnValue(authorizationResult([AuthorizationPrivilege.Read]));

    renderHook(() => useRoleSetManager({ roleSetId, relevantRoles, fetchContributors: true }));

    expect(useRoleSetRoleAssignmentQueryMock).toHaveBeenCalledWith(expect.objectContaining({ skip: false }));
  });

  test('skips the holder-list query when neither the new nor the legacy read privilege is present', () => {
    useRoleSetAuthorizationQueryMock.mockReturnValue(authorizationResult([AuthorizationPrivilege.GrantGlobalAdmins]));

    renderHook(() => useRoleSetManager({ roleSetId, relevantRoles, fetchContributors: true }));

    expect(useRoleSetRoleAssignmentQueryMock).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
  });
});

describe('useRoleSetManager — holdersUnavailable (sec-client-web-2)', () => {
  test('is true when the read privilege is missing and roles were actually requested', () => {
    useRoleSetAuthorizationQueryMock.mockReturnValue(authorizationResult([AuthorizationPrivilege.GrantGlobalAdmins]));

    const { result } = renderHook(() => useRoleSetManager({ roleSetId, relevantRoles, fetchContributors: true }));

    expect(result.current.holdersUnavailable).toBe(true);
  });

  test('is false when the read privilege is present and the query has not errored', () => {
    useRoleSetAuthorizationQueryMock.mockReturnValue(
      authorizationResult([AuthorizationPrivilege.GrantGlobalAdmins, AuthorizationPrivilege.PlatformRoleHoldersRead])
    );

    const { result } = renderHook(() => useRoleSetManager({ roleSetId, relevantRoles, fetchContributors: true }));

    expect(result.current.holdersUnavailable).toBe(false);
  });

  test('is true when the read privilege is present but the query itself errored', () => {
    useRoleSetAuthorizationQueryMock.mockReturnValue(
      authorizationResult([AuthorizationPrivilege.GrantGlobalAdmins, AuthorizationPrivilege.PlatformRoleHoldersRead])
    );
    useRoleSetRoleAssignmentQueryMock.mockReturnValue({
      ...emptyAssignmentResult,
      error: new Error('forbidden'),
    });

    const { result } = renderHook(() => useRoleSetManager({ roleSetId, relevantRoles, fetchContributors: true }));

    expect(result.current.holdersUnavailable).toBe(true);
  });

  test('is false while myPrivileges is still loading', () => {
    useRoleSetAuthorizationQueryMock.mockReturnValue({
      ...authorizationResult([]),
      loading: true,
      data: undefined,
    });

    const { result } = renderHook(() => useRoleSetManager({ roleSetId, relevantRoles, fetchContributors: true }));

    expect(result.current.holdersUnavailable).toBe(false);
  });

  test('is false when no roles were requested (phase-1 myPrivileges-only call)', () => {
    useRoleSetAuthorizationQueryMock.mockReturnValue(authorizationResult([AuthorizationPrivilege.GrantGlobalAdmins]));

    const { result } = renderHook(() => useRoleSetManager({ roleSetId, relevantRoles: [] }));

    expect(result.current.holdersUnavailable).toBe(false);
  });
});
