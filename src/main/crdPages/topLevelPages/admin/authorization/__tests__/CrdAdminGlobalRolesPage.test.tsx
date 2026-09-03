import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import CrdAdminGlobalRolesPage from '../CrdAdminGlobalRolesPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

let mockPathname = '/admin/authorization/roles/GLOBAL_ADMIN';
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: mockPathname }),
}));

const navigateMock = vi.fn();
vi.mock('@/core/routing/useNavigate', () => ({ default: () => navigateMock }));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  usePlatformRoleSetQuery: () => ({ data: { platform: { roleSet: { id: 'rs1' } } } }),
}));

const assignPlatformRoleToUser = vi.fn();
const removePlatformRoleFromUser = vi.fn();
/** Privileges the mocked role-set manager reports; per-test overridable. */
const myPrivilegesMock = vi.fn<() => string[] | undefined>(() => ['GRANT_GLOBAL_ADMINS']);

vi.mock('@/domain/access/RoleSetManager/useRoleSetManager', () => ({
  RELEVANT_ROLES: {
    Platform: [
      'GLOBAL_ADMIN',
      'GLOBAL_SUPPORT',
      'GLOBAL_LICENSE_MANAGER',
      'GLOBAL_COMMUNITY_READER',
      'GLOBAL_SPACES_READER',
      'GLOBAL_PLATFORM_MANAGER',
      'GLOBAL_SUPPORT_MANAGER',
      'PLATFORM_OPERATIONS_ADMIN',
      'PLATFORM_BETA_TESTER',
      'PLATFORM_VC_CAMPAIGN',
      'PLATFORM_ASSISTANT_ACCESS',
    ],
  },
  default: () => ({
    usersByRole: { GLOBAL_ADMIN: [{ id: 'u1', profile: { displayName: 'Alice' }, email: 'alice@x.io' }] },
    assignPlatformRoleToUser,
    removePlatformRoleFromUser,
    loading: false,
    updating: false,
    // These specs exercise a privileged admin; the gated cases live in the
    // "permission gating" block below.
    myPrivileges: myPrivilegesMock(),
  }),
}));

const fetchMore = vi.fn();
vi.mock('@/domain/access/AvailableContributors/useRoleSetAvailableUsers', () => ({
  default: () => ({
    users: [{ id: 'u2', profile: { displayName: 'Bob' }, email: 'bob@x.io' }],
    fetchMore,
    hasMore: false,
    loading: false,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockPathname = '/admin/authorization/roles/GLOBAL_ADMIN';
});

describe('CrdAdminGlobalRolesPage', () => {
  test('offers all eleven global roles as selectable tabs', () => {
    render(<CrdAdminGlobalRolesPage />);
    const nav = screen.getByRole('navigation');
    expect(within(nav).getAllByRole('button')).toHaveLength(11);
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
    await userEvent.click(within(nav).getByRole('button', { name: 'roles.GLOBAL_SUPPORT' }));
    expect(navigateMock).toHaveBeenCalledWith('/admin/authorization/roles/GLOBAL_SUPPORT');
  });

  test('adding an available user assigns the selected role', async () => {
    render(<CrdAdminGlobalRolesPage />);
    await userEvent.click(screen.getByRole('button', { name: 'roleMembers.add' }));
    expect(assignPlatformRoleToUser).toHaveBeenCalledWith('u2', 'GLOBAL_ADMIN');
  });

  test('removing a member (after confirm) revokes the selected role', async () => {
    render(<CrdAdminGlobalRolesPage />);
    await userEvent.click(screen.getByRole('button', { name: 'roleMembers.remove' }));
    const dialog = screen.getByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'roleMembers.remove' }));
    expect(removePlatformRoleFromUser).toHaveBeenCalledWith('u1', 'GLOBAL_ADMIN');
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

  describe('permission gating', () => {
    const addButton = () => screen.getByRole('button', { name: 'roleMembers.add' });
    const removeButton = () => screen.getByRole('button', { name: 'roleMembers.remove' });

    afterEach(() => {
      myPrivilegesMock.mockReturnValue(['GRANT_GLOBAL_ADMINS']);
    });

    // spec FR-002 / SC-007
    test('gates add and remove when the privilege is absent, and dispatches no mutation', async () => {
      // Holding plain GRANT is not enough here: the resolver demands GRANT_GLOBAL_ADMINS.
      myPrivilegesMock.mockReturnValue(['GRANT']);
      render(<CrdAdminGlobalRolesPage />);

      expect(addButton()).toHaveAttribute('aria-disabled', 'true');
      expect(removeButton()).toHaveAttribute('aria-disabled', 'true');

      await userEvent.click(addButton());
      await userEvent.click(removeButton());
      expect(assignPlatformRoleToUser).not.toHaveBeenCalled();
      expect(removePlatformRoleFromUser).not.toHaveBeenCalled();
    });

    test('leaves both controls interactive when the privilege is present', () => {
      myPrivilegesMock.mockReturnValue(['GRANT_GLOBAL_ADMINS']);
      render(<CrdAdminGlobalRolesPage />);

      expect(addButton()).not.toHaveAttribute('aria-disabled');
      expect(removeButton()).not.toHaveAttribute('aria-disabled');
    });

    // spec Edge Case 3 — a completed query that carried no privilege list fails closed
    test('gates when privileges are unavailable', () => {
      myPrivilegesMock.mockReturnValue(undefined);
      render(<CrdAdminGlobalRolesPage />);

      expect(addButton()).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
