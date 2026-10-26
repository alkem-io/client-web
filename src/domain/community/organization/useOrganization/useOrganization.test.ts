import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

let organization: unknown;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('../hooks/useOrganizationContext', () => ({
  useOrganizationContext: () => ({
    organizationId: 'org-1',
    roleSetId: 'rs-1',
    loading: false,
    organization,
    canReadUsers: false,
  }),
}));
vi.mock('@/domain/access/RoleSetManager/useRoleSetManager', () => ({
  default: () => ({ usersByRole: {} }),
  RELEVANT_ROLES: { Organization: [] },
}));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useRolesOrganizationQuery: () => ({ data: undefined, loading: false }),
  useSendMessageToOrganizationMutation: () => [vi.fn()],
}));

import useOrganizationProvider from './useOrganization';

const withPrivileges = (orgPrivileges: AuthorizationPrivilege[], roleSetPrivileges: AuthorizationPrivilege[]) => ({
  id: 'org-1',
  authorization: { id: 'auth-org', myPrivileges: orgPrivileges },
  roleSet: { id: 'rs-1', authorization: { id: 'auth-rs', myPrivileges: roleSetPrivileges } },
});

beforeEach(() => {
  organization = undefined;
});

describe('useOrganizationProvider — permissions', () => {
  it('an organization admin (Update on the organization) can edit and is not on the Support path', () => {
    organization = withPrivileges([AuthorizationPrivilege.Update], [AuthorizationPrivilege.Grant]);
    const { result } = renderHook(() => useOrganizationProvider());

    expect(result.current.permissions.canEdit).toBe(true);
    expect(result.current.permissions.canManageCommunityAsSupport).toBe(false);
  });

  it('Platform Support (the org-membership privilege on the role set only) manages the community but cannot edit', () => {
    organization = withPrivileges(
      [AuthorizationPrivilege.Read],
      [AuthorizationPrivilege.PlatformSupportOrgMembership, AuthorizationPrivilege.RolesetEntryRoleInvite]
    );
    const { result } = renderHook(() => useOrganizationProvider());

    expect(result.current.permissions.canEdit).toBe(false);
    expect(result.current.permissions.canManageCommunityAsSupport).toBe(true);
  });

  it('the org-membership privilege on the organization itself does not count — only the role set grants it', () => {
    organization = withPrivileges([AuthorizationPrivilege.PlatformSupportOrgMembership], []);
    const { result } = renderHook(() => useOrganizationProvider());

    expect(result.current.permissions.canManageCommunityAsSupport).toBe(false);
  });

  it('an inviter alone, or an organization not yet loaded, gets neither', () => {
    organization = withPrivileges([AuthorizationPrivilege.Read], [AuthorizationPrivilege.RolesetEntryRoleInvite]);
    const { result, rerender } = renderHook(() => useOrganizationProvider());
    expect(result.current.permissions).toMatchObject({ canEdit: false, canManageCommunityAsSupport: false });

    organization = undefined;
    rerender();
    expect(result.current.permissions).toMatchObject({ canEdit: false, canManageCommunityAsSupport: false });
  });
});
