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

import useRoleSetManager, {
  getOfferedLegacyPlatformRoles,
  getOfferedPlatformRoles,
  getViewOnlyPlatformRoles,
  RELEVANT_ROLES,
} from '../useRoleSetManager';

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

// sec-client-web-4/spec-clientweb-3/corr-client-web-6: the legacy revoke
// panel must be offered only to an operator the server's legacy resolver
// branches actually let revoke — plain READ + GRANT, not GRANT_GLOBAL_ADMINS
// (which T034 also widens to PLATFORM_ROLES_ADMIN, who the legacy branches
// reject).
describe('getOfferedLegacyPlatformRoles — legacy-revoke gate (sec-client-web-4/spec-clientweb-3)', () => {
  test('offers nothing for undefined privileges', () => {
    expect(getOfferedLegacyPlatformRoles(undefined)).toEqual([]);
  });

  test('offers nothing for a bare GRANT_GLOBAL_ADMINS holder (a Platform Roles Admin, no plain READ/GRANT)', () => {
    expect(getOfferedLegacyPlatformRoles([AuthorizationPrivilege.GrantGlobalAdmins])).toEqual([]);
  });

  test('offers nothing when only one of READ/GRANT is present', () => {
    expect(getOfferedLegacyPlatformRoles([AuthorizationPrivilege.Read])).toEqual([]);
    expect(getOfferedLegacyPlatformRoles([AuthorizationPrivilege.Grant])).toEqual([]);
  });

  test('offers all ten legacy roles for a legacy PlatformAdmin-equivalent holder (plain READ + GRANT)', () => {
    expect(getOfferedLegacyPlatformRoles([AuthorizationPrivilege.Read, AuthorizationPrivilege.Grant])).toEqual([
      ...RELEVANT_ROLES.LegacyPlatform,
    ]);
  });
});

// corr-client-web-7: a legacy holder-list-read privilege authorizes viewing
// the 13 target roles' holders even without a manage privilege — scoped per
// role family so a holder of only one read privilege is never sent a request
// for the role family it doesn't cover (would reproduce the FR-032
// fail-closed-as-a-whole bug one level down).
describe('getViewOnlyPlatformRoles — read-only offer (corr-client-web-7)', () => {
  test('offers nothing for undefined privileges', () => {
    expect(getViewOnlyPlatformRoles(undefined)).toEqual([]);
  });

  test('offers nothing for a holder of neither read privilege', () => {
    expect(getViewOnlyPlatformRoles([AuthorizationPrivilege.GrantGlobalAdmins])).toEqual([]);
  });

  test('plain READ (legacy admitter) offers both role families', () => {
    const roles = getViewOnlyPlatformRoles([AuthorizationPrivilege.Read]);
    for (const role of RELEVANT_ROLES.Platform) {
      expect(roles).toContain(role);
    }
  });

  test('PLATFORM_ROLE_HOLDERS_READ alone offers only the 10 admin roles, not the 3 feature roles', () => {
    const roles = getViewOnlyPlatformRoles([AuthorizationPrivilege.PlatformRoleHoldersRead]);
    expect(roles).toEqual(expect.arrayContaining(RELEVANT_ROLES.Platform.slice(0, 10)));
    expect(roles).not.toEqual(expect.arrayContaining([RELEVANT_ROLES.Platform[10]]));
  });

  test('FEATURE_ROLE_HOLDERS_READ alone offers only the 3 feature roles', () => {
    const roles = getViewOnlyPlatformRoles([AuthorizationPrivilege.FeatureRoleHoldersRead]);
    expect(roles).toEqual(RELEVANT_ROLES.Platform.slice(10));
  });

  test('both holder-read privileges together offer the full 13', () => {
    const roles = getViewOnlyPlatformRoles([
      AuthorizationPrivilege.PlatformRoleHoldersRead,
      AuthorizationPrivilege.FeatureRoleHoldersRead,
    ]);
    expect(roles).toHaveLength(13);
  });
});

// FR-012: pinned here so a future edit to the read-only fallback in
// CrdAdminGlobalRolesPage.tsx can't silently widen who gets manage access.
describe('getOfferedPlatformRoles — manage gate unchanged', () => {
  test('a legacy PlatformAdmin-equivalent holder (READ + GRANT, no GRANT_GLOBAL_ADMINS) is offered no manage roles', () => {
    expect(getOfferedPlatformRoles([AuthorizationPrivilege.Read, AuthorizationPrivilege.Grant])).toEqual([]);
  });
});

// corr-client-web-8: the two assigner privileges gate DISJOINT role families
// server-side and must be UNIONED, not short-circuited — a legacy
// `global-admin` (GRANT_GLOBAL_ADMINS only, no FEATURE_ROLE_ASSIGN) must be
// offered exactly the 10 `Platform …` roles, never the 3 `Feature …` roles the
// server would reject.
describe('getOfferedPlatformRoles — per-family union (corr-client-web-8)', () => {
  test('GRANT_GLOBAL_ADMINS alone offers only the 10 platform admin roles, not the 3 feature roles', () => {
    const roles = getOfferedPlatformRoles([AuthorizationPrivilege.GrantGlobalAdmins]);
    expect(roles).toEqual(RELEVANT_ROLES.Platform.slice(0, 10));
  });

  test('FEATURE_ROLE_ASSIGN alone offers only the 3 feature roles', () => {
    const roles = getOfferedPlatformRoles([AuthorizationPrivilege.FeatureRoleAssign]);
    expect(roles).toEqual(RELEVANT_ROLES.Platform.slice(10));
  });

  test('both privileges together offer the full 13 (platform-roles-admin, T005/SC-009)', () => {
    const roles = getOfferedPlatformRoles([
      AuthorizationPrivilege.GrantGlobalAdmins,
      AuthorizationPrivilege.FeatureRoleAssign,
    ]);
    expect(roles).toHaveLength(13);
  });
});
