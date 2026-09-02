import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import CrdAdminUsersPage from '../CrdAdminUsersPage';

// SettingsTabStrip / dialogs use scrollIntoView; jsdom lacks it.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

const accessGuardMock = vi.fn();
vi.mock('../../useAdminAccessGuard', () => ({
  useAdminAccessGuard: () => accessGuardMock(),
}));

const onDelete = vi.fn();
const fetchMore = vi.fn();
const onSearchTermChange = vi.fn();
const assignLicensePlan = vi.fn();
const revokeLicensePlan = vi.fn();
const userListHookMock = vi.fn();
vi.mock('@/domain/platformAdmin/domain/users/useAdminGlobalUserList', () => ({
  default: () => userListHookMock(),
}));

const changeEmailMock = vi.fn(() => Promise.resolve(true));
vi.mock('@/domain/platformAdmin/domain/users/emailChange/useChangeUserEmail', () => ({
  default: () => ({ changeEmail: changeEmailMock, loading: false, errorMessage: undefined, clearError: vi.fn() }),
}));

const navigateMock = vi.fn();
vi.mock('@/core/routing/useNavigate', () => ({ default: () => navigateMock }));

const baseHookReturn = {
  userList: [
    {
      id: 'u1',
      value: 'Alice (alice@x.io)',
      url: '/user/alice/settings',
      email: 'alice@x.io',
      accountId: 'a1',
      activeLicensePlanIds: ['free'],
    },
    {
      id: 'u2',
      value: 'Bob (bob@x.io)',
      url: '/user/bob/settings',
      email: 'bob@x.io',
      accountId: 'a2',
      activeLicensePlanIds: [],
    },
  ],
  loading: false,
  deleting: false,
  onDelete,
  fetchMore,
  hasMore: true,
  pageSize: 10,
  firstPageSize: 10,
  searchTerm: '',
  onSearchTermChange,
  licensePlans: [
    { id: 'free', name: 'Free', sortOrder: 1 },
    { id: 'plus', name: 'Plus', sortOrder: 2 },
  ],
  assignLicensePlan,
  revokeLicensePlan,
};

beforeEach(() => {
  vi.clearAllMocks();
  accessGuardMock.mockReturnValue({ loading: false, isPlatformAdmin: true });
  userListHookMock.mockReturnValue(baseHookReturn);
});

describe('CrdAdminUsersPage', () => {
  test('renders users with "<displayName> (<email>)" linked names', () => {
    render(<CrdAdminUsersPage />);
    expect(screen.getByRole('link', { name: 'Alice (alice@x.io)' })).toHaveAttribute('href', '/user/alice/settings');
    expect(screen.getByRole('link', { name: 'Bob (bob@x.io)' })).toBeInTheDocument();
  });

  test('search input is wired to the data hook', async () => {
    render(<CrdAdminUsersPage />);
    await userEvent.type(screen.getByRole('searchbox'), 'al');
    expect(onSearchTermChange).toHaveBeenCalled();
  });

  test('"show more" delegates to the hook fetchMore (server pagination)', async () => {
    render(<CrdAdminUsersPage />);
    await userEvent.click(screen.getByRole('button', { name: 'table.loadMore' }));
    expect(fetchMore).toHaveBeenCalled();
  });

  test('delete requires confirmation and then calls the hook onDelete', async () => {
    render(<CrdAdminUsersPage />);
    const deleteButtons = screen.getAllByRole('button', { name: 'table.delete' });
    await userEvent.click(deleteButtons[0]);
    expect(onDelete).not.toHaveBeenCalled();
    const dialog = screen.getByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'table.delete' }));
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'u1' }));
  });

  test('license-plans action opens the dialog and assign delegates to the hook', async () => {
    render(<CrdAdminUsersPage />);
    const manageButtons = screen.getAllByRole('button', { name: 'licensePlans.manage' });
    await userEvent.click(manageButtons[0]); // Alice (account a1, active: free)
    const dialog = screen.getByRole('dialog');
    // Plus is inactive for Alice → the Assign button.
    await userEvent.click(within(dialog).getByRole('button', { name: 'licensePlans.assign' }));
    expect(assignLicensePlan).toHaveBeenCalledWith('a1', 'plus');
  });

  test('change-email action is shown for global admins and submits the mutation', async () => {
    render(<CrdAdminUsersPage />);
    await userEvent.click(screen.getAllByRole('button', { name: 'users.changeEmail.action' })[0]); // Alice
    const dialog = screen.getByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('users.changeEmail.newEmail'), 'new@x.io');
    await userEvent.type(within(dialog).getByLabelText('users.changeEmail.confirmEmail'), 'new@x.io');
    await userEvent.type(within(dialog).getByLabelText('users.changeEmail.reason'), 'support request');
    await userEvent.type(within(dialog).getByLabelText('users.changeEmail.approverName'), 'Admin');
    await userEvent.type(within(dialog).getByLabelText('users.changeEmail.approverRole'), 'Ops');
    await userEvent.click(within(dialog).getByRole('button', { name: 'users.changeEmail.submit' }));
    expect(changeEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ newEmail: 'new@x.io', reason: 'support request' })
    );
  });

  test('change-email action is hidden for non-global-admins', () => {
    accessGuardMock.mockReturnValue({ loading: false, isPlatformAdmin: false });
    render(<CrdAdminUsersPage />);
    expect(screen.queryByRole('button', { name: 'users.changeEmail.action' })).toBeNull();
  });

  test('edit row action navigates to the user edit route', async () => {
    render(<CrdAdminUsersPage />);
    await userEvent.click(screen.getAllByRole('button', { name: 'users.edit' })[0]);
    expect(navigateMock).toHaveBeenCalledWith('/admin/users/u1/edit');
  });
});
