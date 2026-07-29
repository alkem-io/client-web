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
// corr-client-web-3: distinguishes "still fetching myPrivileges" from "fetched,
// offers nothing" — the phase-1 `useRoleSetManager({ relevantRoles: [] })` call.
let mockLoadingPrivileges = false;
// sec-client-web-2: the holder-list read was attempted but is unreachable
// (privilege gap or query error) — distinct from a genuinely empty list.
let mockHoldersUnavailable = false;

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
    // The page calls this hook twice: once with `relevantRoles: []` (phase 1,
    // myPrivileges only) and once with the offered set (phase 2, holder data).
    // `mockLoadingPrivileges` only applies to the phase-1 call, mirroring the
    // real hook where the myPrivileges query doesn't wait on relevantRoles.
    default: ({ relevantRoles }: { relevantRoles: readonly unknown[] }) => ({
      myPrivileges: mockMyPrivileges,
      usersByRole,
      organizationsByRole,
      assignPlatformRoleToUser,
      removePlatformRoleFromUser,
      assignPlatformRoleToOrganization,
      removePlatformRoleFromOrganization,
      loading: relevantRoles.length === 0 ? mockLoadingPrivileges : false,
      updating: false,
      holdersUnavailable: mockHoldersUnavailable,
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
  mockLoadingPrivileges = false;
  mockHoldersUnavailable = false;
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

    // corr-client-web-3: a holder of neither privilege gets an explicit,
    // translated empty state — not a blank nav indistinguishable from a
    // broken page.
    test('a holder of neither assignment privilege sees an explicit empty state, no nav', () => {
      mockMyPrivileges = [];
      render(<CrdAdminGlobalRolesPage />);
      expect(screen.queryByRole('navigation')).toBeNull();
      expect(screen.getByText('roleMembers.noAssignablePrivilege')).toBeInTheDocument();
    });
  });

  // corr-client-web-3: the loading and empty states must be distinguishable —
  // neither renders an indistinguishable blank panel.
  describe('loading and empty states (corr-client-web-3)', () => {
    test('shows a loading indicator while myPrivileges is still loading, no nav yet', () => {
      mockLoadingPrivileges = true;
      render(<CrdAdminGlobalRolesPage />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByRole('navigation')).toBeNull();
      expect(screen.queryByText('roleMembers.noAssignablePrivilege')).toBeNull();
    });

    test('once loaded, a holder of an assignment privilege sees the nav, not the loading indicator', () => {
      mockLoadingPrivileges = false;
      render(<CrdAdminGlobalRolesPage />);
      expect(screen.queryByRole('status')).toBeNull();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  // sec-client-web-2: "read denied/unreachable" must not look like "no holders".
  describe('holder read unavailable (sec-client-web-2)', () => {
    test('renders an explicit unavailable message instead of the misleading noMembers state', () => {
      mockHoldersUnavailable = true;
      mockPathname = '/admin/authorization/roles/PLATFORM_AUDIT_READER';
      render(<CrdAdminGlobalRolesPage />);
      expect(screen.getByRole('alert')).toHaveTextContent('roleMembers.holdersUnavailable');
      expect(screen.queryByText('roleMembers.noMembers')).toBeNull();
    });

    test('renders the normal noMembers state when the read is not flagged unavailable', () => {
      mockHoldersUnavailable = false;
      mockPathname = '/admin/authorization/roles/PLATFORM_AUDIT_READER';
      render(<CrdAdminGlobalRolesPage />);
      expect(screen.getByText('roleMembers.noMembers')).toBeInTheDocument();
      expect(screen.queryByText('roleMembers.holdersUnavailable')).toBeNull();
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
