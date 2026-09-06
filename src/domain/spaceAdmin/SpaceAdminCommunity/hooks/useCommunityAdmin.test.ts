import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock useRoleSetManager before import so useCommunityAdmin picks up the mock
vi.mock('@/domain/access/RoleSetManager/useRoleSetManager', () => ({
  RELEVANT_ROLES: { Community: ['Admin', 'Lead', 'Member'] },
  default: vi.fn(),
}));

vi.mock('@/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations', () => ({
  default: vi.fn(),
}));

vi.mock('@/domain/access/AvailableContributors/useRoleSetAvailableContributors', () => ({
  default: vi.fn(() => ({
    refetch: vi.fn(),
    findAvailableUsersForRoleSetEntryRole: vi.fn(async () => ({ users: [] })),
    findAvailableOrganizationsForRoleSet: vi.fn(async () => ({ organizations: [] })),
  })),
}));

vi.mock('@/domain/access/RoleSetManager/RolesAssignment/useRoleSetManagerRolesAssignment', () => ({
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

import useRoleSetApplicationsAndInvitations from '@/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';
import useCommunityAdmin from './useCommunityAdmin';

const baseRoleSetManagerReturn = {
  users: [],
  organizations: [],
  virtualContributors: [],
  usersByRole: {},
  organizationsByRole: {},
  virtualContributorsByRole: {},
  usersById: {},
  organizationsById: {},
  virtualContributorsById: {},
  rolesDefinitions: undefined,
  myPrivileges: [],
  roleNames: ['Admin', 'Lead', 'Member'],
  loading: false,
  errored: false,
  updating: false,
  refetchRoleSetAssignment: vi.fn(),
  assignRoleToUser: vi.fn(),
  removeRoleFromUser: vi.fn(),
  assignPlatformRoleToUser: vi.fn(),
  removePlatformRoleFromUser: vi.fn(),
  assignRoleToOrganization: vi.fn(),
  removeRoleFromOrganization: vi.fn(),
  assignRoleToVirtualContributor: vi.fn(),
  removeRoleFromVirtualContributor: vi.fn(),
};

const baseApplicationsReturn = {
  applications: [],
  invitations: [],
  platformInvitations: [],
  authorizationPrivileges: [],
  loading: false,
  errored: false,
  isApplying: false,
  refetch: vi.fn(),
  applyForEntryRoleOnRoleSet: vi.fn(),
  applicationStateChange: vi.fn(),
  inviteContributorsOnRoleSet: vi.fn(),
  invitationStateChange: vi.fn(),
  deleteInvitation: vi.fn(),
  deletePlatformInvitation: vi.fn(),
};

describe('useCommunityAdmin errored propagation', () => {
  beforeEach(() => {
    vi.mocked(useRoleSetManager).mockReturnValue(baseRoleSetManagerReturn as ReturnType<typeof useRoleSetManager>);
    vi.mocked(useRoleSetApplicationsAndInvitations).mockReturnValue(
      baseApplicationsReturn as ReturnType<typeof useRoleSetApplicationsAndInvitations>
    );
  });

  it('errored is false when both queries succeed', () => {
    const result = useCommunityAdmin({ roleSetId: 'rs1' });
    expect(result.errored).toBe(false);
  });

  it('errored is true when the members (role-assignment) query errors', () => {
    vi.mocked(useRoleSetManager).mockReturnValue({
      ...baseRoleSetManagerReturn,
      errored: true,
    } as ReturnType<typeof useRoleSetManager>);
    const result = useCommunityAdmin({ roleSetId: 'rs1' });
    expect(result.errored).toBe(true);
  });

  it('errored is true when the applications/invitations query errors', () => {
    vi.mocked(useRoleSetApplicationsAndInvitations).mockReturnValue({
      ...baseApplicationsReturn,
      errored: true,
    } as ReturnType<typeof useRoleSetApplicationsAndInvitations>);
    const result = useCommunityAdmin({ roleSetId: 'rs1' });
    expect(result.errored).toBe(true);
  });

  it('errored is true when both queries error', () => {
    vi.mocked(useRoleSetManager).mockReturnValue({
      ...baseRoleSetManagerReturn,
      errored: true,
    } as ReturnType<typeof useRoleSetManager>);
    vi.mocked(useRoleSetApplicationsAndInvitations).mockReturnValue({
      ...baseApplicationsReturn,
      errored: true,
    } as ReturnType<typeof useRoleSetApplicationsAndInvitations>);
    const result = useCommunityAdmin({ roleSetId: 'rs1' });
    expect(result.errored).toBe(true);
  });
});
