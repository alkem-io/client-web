import { render, screen, within } from '@testing-library/react';
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
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('../SpaceLicensePlansDialog', () => ({
  SpaceLicensePlansDialog: ({ open }: { open: boolean }) => (open ? <div role="dialog">license dialog</div> : null),
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
    authorization: { myPrivileges: [] },
  },
  {
    id: 's2',
    nameID: 's2',
    visibility: 'ARCHIVED',
    about: { id: 'a2', profile: { displayName: 'Beta', url: '/space/beta' }, provider: null },
    authorization: { myPrivileges: [] },
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  useSpacesListMock.mockReturnValue({ data: { platformAdmin: { spaces } }, loading: false });
});

describe('CrdAdminSpacesPage', () => {
  test('renders spaces with archived suffix and account-owner column', () => {
    render(<CrdAdminSpacesPage />);
    expect(screen.getByRole('link', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Beta [ARCHIVED]' })).toBeInTheDocument();
    expect(screen.getByText('Org A')).toBeInTheDocument();
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

  test('edit-settings opens the alias/visibility dialog and saves alias + visibility', async () => {
    render(<CrdAdminSpacesPage />);
    await userEvent.click(screen.getAllByRole('button', { name: 'spaces.editSettings' })[0]);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByDisplayValue('s1')).toBeInTheDocument(); // alias prefilled
    await userEvent.click(within(dialog).getByRole('button', { name: 'spaces.save' }));
    expect(updateSpaceSettingsMock).toHaveBeenCalledWith({
      variables: { spaceId: 's1', nameId: 's1', visibility: 'ACTIVE' },
    });
  });
});
