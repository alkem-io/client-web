import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import CrdAdminSpacesPage from '../CrdAdminSpacesPage';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

const useSpacesListMock = vi.fn();
const deleteSpaceMock = vi.fn();
const updateSpaceSettingsMock = vi.fn(() => Promise.resolve());
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  usePlatformAdminSpacesListQuery: () => useSpacesListMock(),
  useDeleteSpaceMutation: () => [deleteSpaceMock, { loading: false }],
  useUpdateSpacePlatformSettingsMutation: () => [updateSpaceSettingsMock, { loading: false }],
  refetchPlatformAdminSpacesListQuery: () => ({}),
}));
const notify = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));
vi.mock('../SpaceLicensePlansDialog', () => ({
  SpaceLicensePlansDialog: ({ open }: { open: boolean }) => (open ? <div role="dialog">license dialog</div> : null),
}));
const canManageLicensePlansMock = vi.fn();
vi.mock('@/domain/platformAdmin/domain/licensing/useCanManageLicensePlans', () => ({
  default: () => canManageLicensePlansMock(),
}));

const spaces = [
  {
    id: 's1',
    nameID: 's1',
    visibility: 'ACTIVE',
    about: {
      id: 'a1',
      profile: { displayName: 'Alpha', url: '/space/alpha' },
      provider: { profile: { displayName: 'Org A' } },
    },
    authorization: { myPrivileges: ['ACCOUNT_LICENSE_MANAGE', 'DELETE'] },
  },
  {
    id: 's2',
    nameID: 's2',
    visibility: 'ARCHIVED',
    about: { id: 'a2', profile: { displayName: 'Beta', url: '/space/beta' }, provider: null },
    authorization: { myPrivileges: ['ACCOUNT_LICENSE_MANAGE', 'DELETE'] },
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  useSpacesListMock.mockReturnValue({ data: { platformAdmin: { spaces } }, loading: false });
  updateSpaceSettingsMock.mockResolvedValue(undefined);
  canManageLicensePlansMock.mockReturnValue(true);
});

describe('CrdAdminSpacesPage', () => {
  test('renders spaces with archived suffix and account-owner column', () => {
    render(<CrdAdminSpacesPage />);
    expect(screen.getByRole('link', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Beta [ARCHIVED]' })).toBeInTheDocument();
    expect(screen.getByText('Org A')).toBeInTheDocument();
  });

  test('a space whose provider field was dropped (auth error → null) still renders, with N/A owner', () => {
    // Mirrors the partial-data the server returns when one space has a corrupt
    // authorization policy on `about.provider`: that field comes back null while
    // every other space resolves. The row must survive, not blank the list.
    render(<CrdAdminSpacesPage />);
    expect(screen.getByRole('link', { name: 'Beta [ARCHIVED]' })).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  test('search filters the list client-side', async () => {
    render(<CrdAdminSpacesPage />);
    await userEvent.type(screen.getByRole('searchbox'), 'alpha');
    expect(screen.getByRole('link', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Beta [ARCHIVED]' })).toBeNull();
  });

  test('delete requires confirmation then calls deleteSpace with the space id', async () => {
    render(<CrdAdminSpacesPage />);
    const deleteButtons = screen.getAllByRole('button', { name: 'table.delete' });
    await userEvent.click(deleteButtons[0]);
    expect(deleteSpaceMock).not.toHaveBeenCalled();
    const dialog = screen.getByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'table.delete' }));
    expect(deleteSpaceMock).toHaveBeenCalledWith({ variables: { spaceId: 's1' } });
  });

  test('license-plans action opens the space license dialog', async () => {
    render(<CrdAdminSpacesPage />);
    const manageButtons = screen.getAllByRole('button', { name: 'licensePlans.manage' });
    await userEvent.click(manageButtons[0]);
    expect(screen.getByRole('dialog')).toHaveTextContent('license dialog');
  });

  // client-8: an unchanged alias must not be sent — the server treats a resend as a
  // rename attempt. This fails on the head, which always sends the current alias.
  test('saving an unchanged alias sends nameId: undefined', async () => {
    render(<CrdAdminSpacesPage />);
    await userEvent.click(screen.getAllByRole('button', { name: 'spaces.editSettings' })[0]);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByDisplayValue('s1')).toBeInTheDocument(); // alias prefilled
    await userEvent.click(within(dialog).getByRole('button', { name: 'spaces.save' }));
    expect(updateSpaceSettingsMock).toHaveBeenCalledWith({
      variables: { spaceId: 's1', nameId: undefined, visibility: 'ACTIVE' },
    });
  });

  test('saving a changed alias sends the trimmed value', async () => {
    render(<CrdAdminSpacesPage />);
    await userEvent.click(screen.getAllByRole('button', { name: 'spaces.editSettings' })[0]);
    const dialog = screen.getByRole('dialog');
    const aliasInput = within(dialog).getByDisplayValue('s1');
    await userEvent.clear(aliasInput);
    await userEvent.type(aliasInput, ' new-alias ');
    await userEvent.click(within(dialog).getByRole('button', { name: 'spaces.save' }));
    expect(updateSpaceSettingsMock).toHaveBeenCalledWith({
      variables: { spaceId: 's1', nameId: 'new-alias', visibility: 'ACTIVE' },
    });
  });

  // client-8: a denied save must surface the standard toast and leave the dialog open
  // so the admin can see the failure, instead of silently closing. Fails on the head.
  test('a FORBIDDEN_POLICY rejection notifies and keeps the dialog open', async () => {
    updateSpaceSettingsMock.mockRejectedValueOnce({
      graphQLErrors: [{ message: 'nope', extensions: { code: 'FORBIDDEN_POLICY' } }],
    });
    render(<CrdAdminSpacesPage />);
    await userEvent.click(screen.getAllByRole('button', { name: 'spaces.editSettings' })[0]);
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'spaces.save' }));

    await waitFor(() => expect(notify).toHaveBeenCalledWith('permissions.errorDenied', 'error'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('license-plans action is absent without the manage-license-plans capability', () => {
    canManageLicensePlansMock.mockReturnValue(false);
    render(<CrdAdminSpacesPage />);
    expect(screen.queryByRole('button', { name: 'licensePlans.manage' })).toBeNull();
  });

  test('edit-settings action is absent without canEditPlatformSettings', () => {
    useSpacesListMock.mockReturnValue({
      data: {
        platformAdmin: {
          spaces: [{ ...spaces[0], authorization: { myPrivileges: ['READ'] } }],
        },
      },
      loading: false,
    });
    render(<CrdAdminSpacesPage />);
    expect(screen.queryByRole('button', { name: 'spaces.editSettings' })).toBeNull();
  });
});
