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
const updateSpaceVisibilityMock = vi.fn(() => Promise.resolve());
const updateSpaceNameIdMock = vi.fn(() => Promise.resolve());
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  usePlatformAdminSpacesListQuery: () => useSpacesListMock(),
  useDeleteSpaceMutation: () => [deleteSpaceMock, { loading: false }],
  useAdminUpdateSpaceVisibilityMutation: () => [updateSpaceVisibilityMock, { loading: false }],
  useAdminUpdateSpaceNameIdMutation: () => [updateSpaceNameIdMock, { loading: false }],
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
  updateSpaceVisibilityMock.mockResolvedValue(undefined);
  updateSpaceNameIdMock.mockResolvedValue(undefined);
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

  // 027-platform-role-redesign (T013, FR-020): alias and visibility are two
  // mutations owned by different roles, each sent ONLY when its value changed
  // (client-8's "an unchanged alias is never sent" is the nothing-changed case).
  test('edit-settings opens the alias/visibility dialog; saving with nothing changed sends nothing', async () => {
    render(<CrdAdminSpacesPage />);
    await userEvent.click(screen.getAllByRole('button', { name: 'spaces.editSettings' })[0]);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByDisplayValue('s1')).toBeInTheDocument(); // alias prefilled
    await userEvent.click(within(dialog).getByRole('button', { name: 'spaces.save' }));
    expect(updateSpaceVisibilityMock).not.toHaveBeenCalled();
    expect(updateSpaceNameIdMock).not.toHaveBeenCalled();
  });

  test('changing only the alias sends the trimmed protected nameID update and not the visibility one', async () => {
    render(<CrdAdminSpacesPage />);
    await userEvent.click(screen.getAllByRole('button', { name: 'spaces.editSettings' })[0]);
    const dialog = screen.getByRole('dialog');
    const alias = within(dialog).getByDisplayValue('s1');
    await userEvent.clear(alias);
    await userEvent.type(alias, ' s1-renamed ');
    await userEvent.click(within(dialog).getByRole('button', { name: 'spaces.save' }));
    expect(updateSpaceNameIdMock).toHaveBeenCalledWith({
      variables: { spaceId: 's1', nameId: 's1-renamed' },
    });
    expect(updateSpaceVisibilityMock).not.toHaveBeenCalled();
  });

  // client-8: a denied save must surface the standard toast and leave the dialog open
  // so the admin can see the failure, instead of silently closing.
  test('a FORBIDDEN_POLICY rejection notifies and keeps the dialog open', async () => {
    updateSpaceNameIdMock.mockRejectedValueOnce({
      graphQLErrors: [{ message: 'nope', extensions: { code: 'FORBIDDEN_POLICY' } }],
    });
    render(<CrdAdminSpacesPage />);
    await userEvent.click(screen.getAllByRole('button', { name: 'spaces.editSettings' })[0]);
    const dialog = screen.getByRole('dialog');
    const alias = within(dialog).getByDisplayValue('s1');
    await userEvent.clear(alias);
    await userEvent.type(alias, 's1-renamed');
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
