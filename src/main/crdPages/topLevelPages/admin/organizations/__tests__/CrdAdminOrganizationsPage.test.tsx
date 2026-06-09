import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import CrdAdminOrganizationsPage from '../CrdAdminOrganizationsPage';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

const onDelete = vi.fn();
const handleVerification = vi.fn();
const fetchMore = vi.fn();
const onSearchTermChange = vi.fn();
const assignLicensePlan = vi.fn();
const revokeLicensePlan = vi.fn();
const orgHookMock = vi.fn();
vi.mock('@/domain/platformAdmin/domain/organizations/usePlatformAdminOrganizationsList', () => ({
  default: () => orgHookMock(),
}));

const baseReturn = {
  organizations: [
    { id: 'o1', value: 'Acme', url: '/org/acme', verified: true, accountId: 'a1', activeLicensePlanIds: ['free'] },
    { id: 'o2', value: 'Globex', url: '/org/globex', verified: false, accountId: 'a2', activeLicensePlanIds: [] },
  ],
  loading: false,
  onDelete,
  handleVerification,
  searchTerm: '',
  onSearchTermChange,
  fetchMore,
  hasMore: false,
  pageSize: 10,
  firstPageSize: 10,
  licensePlans: [
    { id: 'free', name: 'Free', sortOrder: 1 },
    { id: 'plus', name: 'Plus', sortOrder: 2 },
  ],
  assignLicensePlan,
  revokeLicensePlan,
  error: undefined,
};

beforeEach(() => {
  vi.clearAllMocks();
  orgHookMock.mockReturnValue(baseReturn);
});

describe('CrdAdminOrganizationsPage', () => {
  test('renders organizations with a verification column', () => {
    render(<CrdAdminOrganizationsPage />);
    expect(screen.getByRole('link', { name: 'Acme' })).toHaveAttribute('href', '/org/acme');
    expect(screen.getByText('organizations.verified')).toBeInTheDocument();
    expect(screen.getByText('organizations.notVerified')).toBeInTheDocument();
  });

  test('verification toggle delegates to the hook', async () => {
    render(<CrdAdminOrganizationsPage />);
    const toggles = screen.getAllByRole('button', { name: 'organizations.toggleVerification' });
    await userEvent.click(toggles[0]);
    expect(handleVerification).toHaveBeenCalledWith(expect.objectContaining({ id: 'o1' }));
  });

  test('delete confirms then calls the hook onDelete', async () => {
    render(<CrdAdminOrganizationsPage />);
    await userEvent.click(screen.getAllByRole('button', { name: 'table.delete' })[0]);
    expect(onDelete).not.toHaveBeenCalled();
    const dialog = screen.getByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'table.delete' }));
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'o1' }));
  });

  test('license-plans action opens the dialog and assign delegates to the hook', async () => {
    render(<CrdAdminOrganizationsPage />);
    await userEvent.click(screen.getAllByRole('button', { name: 'licensePlans.manage' })[0]);
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'licensePlans.assign' }));
    expect(assignLicensePlan).toHaveBeenCalledWith('a1', 'plus');
  });
});
