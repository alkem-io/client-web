import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { RELEVANT_ROLES } from '@/domain/access/RoleSetManager/useRoleSetManager';
import CrdAdminGlobalRolesPage from '../CrdAdminGlobalRolesPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

let mockPathname = '/admin/authorization/roles/PLATFORM_ROLES_ADMIN';
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: mockPathname }),
}));

const navigateMock = vi.fn();
vi.mock('@/core/routing/useNavigate', () => ({ default: () => navigateMock }));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  usePlatformRoleSetQuery: () => ({ data: { platform: { roleSet: { id: 'rs1' } } } }),
}));

// FR-012: `myPrivileges` is the only signal the offered-role filter reads. Tests
// drive it directly rather than mocking `getOfferedPlatformRoles` itself, so the
// real filter (from useRoleSetManager.ts) is what's under test here (T008).
let mockMyPrivileges: AuthorizationPrivilege[] = [AuthorizationPrivilege.GrantGlobalAdmins];

const usersByRole = {
  PLATFORM_ROLES_ADMIN: [{ id: 'u1', profile: { displayName: 'Alice' }, email: 'alice@x.io' }],
};
const organizationsByRole = {
  FEATURE_BETA_TESTER: [{ id: 'o1', profile: { displayName: 'Acme Org' } }],
};

const assignPlatformRoleToUser = vi.fn();
const removePlatformRoleFromUser = vi.fn();
const assignPlatformRoleToOrganization = vi.fn();
const removePlatformRoleFromOrganization = vi.fn();

vi.mock('@/domain/access/RoleSetManager/useRoleSetManager', async importOriginal => {
  const actual = await importOriginal<typeof import('@/domain/access/RoleSetManager/useRoleSetManager')>();
  return {
    ...actual,
    default: () => ({
      myPrivileges: mockMyPrivileges,
      usersByRole,
      organizationsByRole,
      assignPlatformRoleToUser,
      removePlatformRoleFromUser,
      assignPlatformRoleToOrganization,
      removePlatformRoleFromOrganization,
      loading: false,
      updating: false,
    }),
  };
});

const fetchMore = vi.fn();
vi.mock('@/domain/access/AvailableContributors/useRoleSetAvailableUsers', () => ({
  default: () => ({
    users: [{ id: 'u2', profile: { displayName: 'Bob' }, email: 'bob@x.io' }],
    fetchMore,
    hasMore: false,
    loading: false,
  }),
}));

const fetchMoreOrganizations = vi.fn();
vi.mock('@/domain/access/AvailableContributors/useRoleSetAvailableOrganizationsOnPlatform', () => ({
  default: () => ({
    organizations: [{ id: 'o2', profile: { displayName: 'Beta Org' } }],
    fetchMore: fetchMoreOrganizations,
    hasMore: false,
    loading: false,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockPathname = '/admin/authorization/roles/PLATFORM_ROLES_ADMIN';
  mockMyPrivileges = [AuthorizationPrivilege.GrantGlobalAdmins];
});

describe('CrdAdminGlobalRolesPage', () => {
  test('offers all thirteen target roles as selectable tabs for a Platform Roles Admin', () => {
    render(<CrdAdminGlobalRolesPage />);
    const nav = screen.getByRole('navigation');
    expect(within(nav).getAllByRole('button')).toHaveLength(13);
    for (const role of RELEVANT_ROLES.Platform) {
      expect(within(nav).getByRole('button', { name: `roles.${role}` })).toBeInTheDocument();
    }
  });

  test('every offered role renders its label and description when selected', () => {
    for (const role of RELEVANT_ROLES.Platform) {
      mockPathname = `/admin/authorization/roles/${role}`;
      const { unmount } = render(<CrdAdminGlobalRolesPage />);
      const nav = screen.getByRole('navigation');
      expect(within(nav).getByRole('button', { name: `roles.${role}` })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByText(`roleDescriptions.${role}`)).toBeInTheDocument();
      unmount();
    }
  });

  test('renders the Platform Operations Admin label and its role description when selected', () => {
    mockPathname = '/admin/authorization/roles/PLATFORM_OPERATIONS_ADMIN';
    render(<CrdAdminGlobalRolesPage />);
    const nav = screen.getByRole('navigation');
    const tab = within(nav).getByRole('button', { name: 'roles.PLATFORM_OPERATIONS_ADMIN' });
    expect(tab).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('roleDescriptions.PLATFORM_OPERATIONS_ADMIN')).toBeInTheDocument();
  });

  test('lists the current members and available users for the selected role', () => {
    render(<CrdAdminGlobalRolesPage />);
    expect(screen.getByText('Alice (alice@x.io)')).toBeInTheDocument();
    expect(screen.getByText('Bob (bob@x.io)')).toBeInTheDocument();
  });

  test('selecting a role navigates to its URL', async () => {
    render(<CrdAdminGlobalRolesPage />);
    const nav = screen.getByRole('navigation');
    await userEvent.click(within(nav).getByRole('button', { name: 'roles.PLATFORM_CONTENT_FULL_ACCESS' }));
    expect(navigateMock).toHaveBeenCalledWith('/admin/authorization/roles/PLATFORM_CONTENT_FULL_ACCESS');
  });

  test('adding an available user assigns the selected role', async () => {
    render(<CrdAdminGlobalRolesPage />);
    await userEvent.click(screen.getByRole('button', { name: 'roleMembers.add' }));
    expect(assignPlatformRoleToUser).toHaveBeenCalledWith('u2', 'PLATFORM_ROLES_ADMIN');
  });

  test('removing a member (after confirm) revokes the selected role', async () => {
    render(<CrdAdminGlobalRolesPage />);
    await userEvent.click(screen.getByRole('button', { name: 'roleMembers.remove' }));
    const dialog = screen.getByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'roleMembers.remove' }));
    expect(removePlatformRoleFromUser).toHaveBeenCalledWith('u1', 'PLATFORM_ROLES_ADMIN');
  });

  test('filtering current members narrows the list client-side without refetching', async () => {
    render(<CrdAdminGlobalRolesPage />);
    expect(screen.getByText('Alice (alice@x.io)')).toBeInTheDocument();

    const filter = screen.getByPlaceholderText('roleMembers.filterMembersPlaceholder');
    await userEvent.type(filter, 'ali');
    expect(screen.getByText('Alice (alice@x.io)')).toBeInTheDocument(); // matches name

    await userEvent.clear(filter);
    await userEvent.type(filter, 'zzz');
    expect(screen.queryByText('Alice (alice@x.io)')).toBeNull(); // filtered out
    expect(screen.getByText('roleMembers.noResults')).toBeInTheDocument();
  });

  // T008 [US2]: the assigner filter (FR-012) — no reimplementation of any
  // server rule, just the offer/deny split driven by `myPrivileges`.
  describe('assigner-capability filter (FR-012)', () => {
    test('a holder of only FEATURE_ROLE_ASSIGN is offered exactly the 3 Feature roles', () => {
      mockMyPrivileges = [AuthorizationPrivilege.FeatureRoleAssign];
      mockPathname = '/admin/authorization/roles/FEATURE_BETA_TESTER';
      render(<CrdAdminGlobalRolesPage />);
      const nav = screen.getByRole('navigation');
      const buttons = within(nav).getAllByRole('button');
      expect(buttons).toHaveLength(3);
      expect(within(nav).getByRole('button', { name: 'roles.FEATURE_BETA_TESTER' })).toBeInTheDocument();
      expect(within(nav).getByRole('button', { name: 'roles.FEATURE_VIRTUAL_ASSISTANT' })).toBeInTheDocument();
      expect(within(nav).getByRole('button', { name: 'roles.FEATURE_ORGANIZATION_CREATOR' })).toBeInTheDocument();
      expect(within(nav).queryByRole('button', { name: 'roles.PLATFORM_ROLES_ADMIN' })).toBeNull();
    });

    test('a holder of GRANT_GLOBAL_ADMINS is offered all 13 roles', () => {
      mockMyPrivileges = [AuthorizationPrivilege.GrantGlobalAdmins];
      render(<CrdAdminGlobalRolesPage />);
      const nav = screen.getByRole('navigation');
      expect(within(nav).getAllByRole('button')).toHaveLength(13);
    });

    test('a holder of neither assignment privilege is offered no roles', () => {
      mockMyPrivileges = [];
      render(<CrdAdminGlobalRolesPage />);
      const nav = screen.getByRole('navigation');
      expect(within(nav).queryAllByRole('button')).toHaveLength(0);
    });
  });

  // T007a / SC-009: the organization holder-kind section exists only on the
  // 3 `Feature …` roles — never on a `Platform …` role.
  describe('organization holder kind (SC-009)', () => {
    test('shows the organization section for a Feature role', () => {
      mockPathname = '/admin/authorization/roles/FEATURE_BETA_TESTER';
      render(<CrdAdminGlobalRolesPage />);
      expect(screen.getByText('roleMembers.organizations')).toBeInTheDocument();
      expect(screen.getByText('Acme Org')).toBeInTheDocument();
      expect(screen.getByText('Beta Org')).toBeInTheDocument();
    });

    test('hides the organization section for a Platform role', () => {
      mockPathname = '/admin/authorization/roles/PLATFORM_ROLES_ADMIN';
      render(<CrdAdminGlobalRolesPage />);
      expect(screen.queryByText('roleMembers.organizations')).toBeNull();
    });
  });
});
