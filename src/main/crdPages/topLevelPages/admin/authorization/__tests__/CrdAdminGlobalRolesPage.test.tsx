import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import CrdAdminGlobalRolesPage from '../CrdAdminGlobalRolesPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/admin/authorization/roles/GLOBAL_ADMIN' }),
}));

const navigateMock = vi.fn();
vi.mock('@/core/routing/useNavigate', () => ({ default: () => navigateMock }));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  usePlatformRoleSetQuery: () => ({ data: { platform: { roleSet: { id: 'rs1' } } } }),
}));

const assignPlatformRoleToUser = vi.fn();
const removePlatformRoleFromUser = vi.fn();
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
      'PLATFORM_BETA_TESTER',
      'PLATFORM_VC_CAMPAIGN',
    ],
  },
  default: () => ({
    usersByRole: { GLOBAL_ADMIN: [{ id: 'u1', profile: { displayName: 'Alice' }, email: 'alice@x.io' }] },
    assignPlatformRoleToUser,
    removePlatformRoleFromUser,
    loading: false,
    updating: false,
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

beforeEach(() => vi.clearAllMocks());

describe('CrdAdminGlobalRolesPage', () => {
  test('offers all nine global roles as selectable tabs', () => {
    render(<CrdAdminGlobalRolesPage />);
    const nav = screen.getByRole('navigation');
    expect(within(nav).getAllByRole('button')).toHaveLength(9);
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
});
