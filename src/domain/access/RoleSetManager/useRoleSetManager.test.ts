import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the two generated Apollo queries and the roles-assignment hook so the hook
// can be exercised as a plain function (no React runtime needed) — same pattern as
// useCommunityAdmin.test.ts. We only assert the `errored` aggregation here.
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useRoleSetAuthorizationQuery: vi.fn(),
  useRoleSetRoleAssignmentQuery: vi.fn(),
}));

vi.mock('./RolesAssignment/useRoleSetManagerRolesAssignment', () => ({
  default: vi.fn(() => ({
    assignRoleToUser: vi.fn(),
    removeRoleFromUser: vi.fn(),
    assignPlatformRoleToUser: vi.fn(),
    removePlatformRoleFromUser: vi.fn(),
    assignRoleToOrganization: vi.fn(),
    removeRoleFromOrganization: vi.fn(),
    assignRoleToVirtualContributor: vi.fn(),
    removeRoleFromVirtualContributor: vi.fn(),
    loading: false,
  })),
}));

import { useRoleSetAuthorizationQuery, useRoleSetRoleAssignmentQuery } from '@/core/apollo/generated/apollo-hooks';
import useRoleSetManager, { RELEVANT_ROLES } from './useRoleSetManager';

const authOk = { data: undefined, loading: false, error: undefined };
const assignmentOk = { data: undefined, loading: false, error: undefined, refetch: vi.fn() };

const run = () => useRoleSetManager({ roleSetId: 'rs1', relevantRoles: RELEVANT_ROLES.Community });

describe('useRoleSetManager errored aggregation', () => {
  beforeEach(() => {
    vi.mocked(useRoleSetRoleAssignmentQuery).mockReturnValue(
      assignmentOk as unknown as ReturnType<typeof useRoleSetRoleAssignmentQuery>
    );
    vi.mocked(useRoleSetAuthorizationQuery).mockReturnValue(authOk as ReturnType<typeof useRoleSetAuthorizationQuery>);
  });

  it('errored is false when both queries succeed', () => {
    expect(run().errored).toBe(false);
  });

  it('errored is true when the authorization query errors (member CSV must not export empty)', () => {
    vi.mocked(useRoleSetAuthorizationQuery).mockReturnValue({
      ...authOk,
      error: new Error('authorization denied'),
    } as ReturnType<typeof useRoleSetAuthorizationQuery>);
    expect(run().errored).toBe(true);
  });

  it('errored is true when the role-assignment query errors', () => {
    vi.mocked(useRoleSetRoleAssignmentQuery).mockReturnValue({
      ...assignmentOk,
      error: new Error('assignment failed'),
    } as unknown as ReturnType<typeof useRoleSetRoleAssignmentQuery>);
    expect(run().errored).toBe(true);
  });
});
