import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import CrdAdminLicensingPage from '../CrdAdminLicensingPage';

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

const spacesQueryMock = vi.fn();
const orgsQueryMock = vi.fn();
const usersQueryMock = vi.fn();
const plansQueryMock = vi.fn();
const updateVisibilityMock = vi.fn(() => Promise.resolve());
const assignAccountPlanMock = vi.fn(() => Promise.resolve());
const revokeAccountPlanMock = vi.fn(() => Promise.resolve());
const updatePromoteMock = vi.fn((_options: unknown) => Promise.resolve());
const notify = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useLicensingAdminSpacesQuery: () => spacesQueryMock(),
  useLicensingAdminOrganizationsQuery: () => orgsQueryMock(),
  useLicensingAdminUsersQuery: () => usersQueryMock(),
  usePlatformLicensingPlansQuery: () => plansQueryMock(),
  useAdminUpdateSpaceVisibilityMutation: () => [updateVisibilityMock, { loading: false }],
  useAdminUpdateSpacePromoteMutation: () => [updatePromoteMock, { loading: false }],
  useAssignLicensePlanToAccountMutation: () => [assignAccountPlanMock, { loading: false }],
  useRevokeLicensePlanFromAccountMutation: () => [revokeAccountPlanMock, { loading: false }],
  refetchLicensingAdminSpacesQuery: () => ({}),
  refetchLicensingAdminOrganizationsQuery: () => ({}),
  refetchLicensingAdminUsersQuery: () => ({}),
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));
vi.mock('../../spaces/SpaceLicensePlansDialog', () => ({
  SpaceLicensePlansDialog: ({ open, title }: { open: boolean; title: string }) =>
    open ? <div role="dialog">space plans: {title}</div> : null,
}));
vi.mock('@/crd/components/admin/licensePlans/AccountLicensePlansDialog', () => ({
  AccountLicensePlansDialog: ({
    open,
    title,
    activePlanIds,
    onAssign,
  }: {
    open: boolean;
    title: string;
    activePlanIds: string[];
    onAssign: (id: string) => void;
  }) =>
    open ? (
      <div role="dialog">
        account plans: {title} [{activePlanIds.join(',')}]
        <button type="button" onClick={() => onAssign('plan-account-plus')}>
          assign
        </button>
      </div>
    ) : null,
}));
// The Radix select cannot be driven in jsdom; the page is tested through the
// same contract the real control fulfils (value + onValueChange).
vi.mock('../LicensingVisibilitySelect', () => ({
  LicensingVisibilitySelect: ({
    value,
    onValueChange,
    ariaLabel,
  }: {
    value: string;
    onValueChange: (v: string) => void;
    ariaLabel: string;
  }) => (
    <select aria-label={ariaLabel} value={value} onChange={e => onValueChange(e.target.value)}>
      <option value="ACTIVE">ACTIVE</option>
      <option value="ARCHIVED">ARCHIVED</option>
      <option value="DEMO">DEMO</option>
      <option value="INACTIVE">INACTIVE</option>
    </select>
  ),
}));

const plans = [
  {
    id: 'plan-space-plus',
    name: 'Space Plus',
    type: 'SPACE_PLAN',
    licenseCredential: 'SPACE_LICENSE_PLUS',
    sortOrder: 1,
  },
  {
    id: 'plan-space-wb',
    name: 'Whiteboards',
    type: 'SPACE_FEATURE_FLAG',
    licenseCredential: 'SPACE_FEATURE_WHITEBOARD_MULTI_USER',
    sortOrder: 2,
  },
  {
    id: 'plan-account-plus',
    name: 'Account Plus',
    type: 'ACCOUNT_PLAN',
    licenseCredential: 'ACCOUNT_LICENSE_PLUS',
    sortOrder: 3,
  },
];

const spaces = [
  {
    id: 's1',
    nameID: 'climate',
    visibility: 'ACTIVE',
    subscriptions: [{ name: 'SPACE_LICENSE_PLUS' }, { name: 'SPACE_FEATURE_WHITEBOARD_MULTI_USER' }],
    about: {
      id: 'a1',
      profile: { id: 'p1', displayName: 'Climate Lab', url: '/space/climate' },
      provider: { id: 'o1', profile: { id: 'p2', displayName: 'Deltares' } },
    },
  },
  {
    id: 's2',
    nameID: 'demo',
    visibility: 'DEMO',
    subscriptions: [],
    about: { id: 'a2', profile: { id: 'p3', displayName: 'Demo Space', url: '/space/demo' }, provider: null },
  },
];
const organizations = [
  {
    id: 'o1',
    account: { id: 'acc-o1', subscriptions: [{ name: 'ACCOUNT_LICENSE_PLUS' }] },
    profile: { id: 'p', url: '/org/deltares', displayName: 'Deltares' },
  },
];
const users = [
  {
    id: 'u1',
    account: { id: 'acc-u1', subscriptions: [] },
    profile: { id: 'p', url: '/user/anna', displayName: 'Anna Kowalski' },
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  updatePromoteMock.mockResolvedValue(undefined);
  plansQueryMock.mockReturnValue({ data: { platform: { licensingFramework: { id: 'lf', plans } } } });
  spacesQueryMock.mockReturnValue({ data: { platformAdmin: { spaces } }, loading: false });
  orgsQueryMock.mockReturnValue({
    data: {
      platformAdmin: { organizations: { total: 1, organization: organizations, pageInfo: { hasNextPage: false } } },
    },
    loading: false,
    fetchMore: vi.fn(),
  });
  usersQueryMock.mockReturnValue({
    data: { platformAdmin: { users: { total: 1, users, pageInfo: { hasNextPage: false } } } },
    loading: false,
    fetchMore: vi.fn(),
  });
});

describe('CrdAdminLicensingPage', () => {
  test('renders the three sub-tabs and opens on Spaces', () => {
    render(<CrdAdminLicensingPage />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map(tab => tab.textContent)).toEqual([
      'licensing.tabs.spaces',
      'licensing.tabs.organizations',
      'licensing.tabs.users',
    ]);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('link', { name: 'Climate Lab' })).toBeInTheDocument();
  });

  test('Spaces rows show owner, active plans as badges, and an inline visibility control', () => {
    render(<CrdAdminLicensingPage />);
    const row = screen.getByRole('link', { name: 'Climate Lab' }).closest('tr') as HTMLElement;
    expect(within(row).getByText('Deltares')).toBeInTheDocument();
    expect(within(row).getByText('Space Plus')).toBeInTheDocument();
    expect(within(row).getByText('Whiteboards')).toBeInTheDocument();
    expect(within(row).getByLabelText('licensing.visibilityOf:{"name":"Climate Lab"}')).toHaveValue('ACTIVE');
    // A space with no plans says so instead of rendering an empty cell.
    const demo = screen.getByRole('link', { name: 'Demo Space' }).closest('tr') as HTMLElement;
    expect(within(demo).getByText('licensing.noPlans')).toBeInTheDocument();
  });

  test('changing visibility fires A14 with visibility only — never the alias', async () => {
    render(<CrdAdminLicensingPage />);
    const select = screen.getByLabelText('licensing.visibilityOf:{"name":"Climate Lab"}');
    await userEvent.selectOptions(select, 'ARCHIVED');
    expect(updateVisibilityMock).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { spaceId: 's1', visibility: 'ARCHIVED' } })
    );
  });

  test('the manage button on a space opens the space plans dialog', async () => {
    render(<CrdAdminLicensingPage />);
    const row = screen.getByRole('link', { name: 'Climate Lab' }).closest('tr') as HTMLElement;
    await userEvent.click(within(row).getByRole('button', { name: 'licensePlans.manage' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('space plans: Climate Lab');
  });

  test('Organizations tab lists account plans and opens the account dialog with the active ids', async () => {
    render(<CrdAdminLicensingPage />);
    await userEvent.click(screen.getByRole('tab', { name: 'licensing.tabs.organizations' }));
    const row = screen.getByRole('link', { name: 'Deltares' }).closest('tr') as HTMLElement;
    expect(within(row).getByText('Account Plus')).toBeInTheDocument();
    await userEvent.click(within(row).getByRole('button', { name: 'licensePlans.manage' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('account plans: Deltares [plan-account-plus]');
  });

  test('Users tab shows display names only — never an email — and assigns against the account', async () => {
    render(<CrdAdminLicensingPage />);
    await userEvent.click(screen.getByRole('tab', { name: 'licensing.tabs.users' }));
    const row = screen.getByRole('link', { name: 'Anna Kowalski' }).closest('tr') as HTMLElement;
    expect(row.textContent).not.toMatch(/@/);
    await userEvent.click(within(row).getByRole('button', { name: 'licensePlans.manage' }));
    await userEvent.click(screen.getByRole('button', { name: 'assign' }));
    expect(assignAccountPlanMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { accountId: 'acc-u1', licensePlanId: 'plan-account-plus', licensingId: 'lf' },
      })
    );
  });

  test('offers no delete and no settings action', () => {
    render(<CrdAdminLicensingPage />);
    expect(screen.queryByRole('button', { name: 'table.delete' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'spaces.editSettings' })).not.toBeInTheDocument();
  });

  describe('Spaces Promote column', () => {
    const promoteLabel = (name: string) => `columns.promoteOf:${JSON.stringify({ name })}`;
    const withPromote = (values: (boolean | null)[]) =>
      spacesQueryMock.mockReturnValue({
        data: { platformAdmin: { spaces: spaces.map((space, i) => ({ ...space, promote: values[i] })) } },
        loading: false,
      });

    test('is the last header before Actions when a row carries a promote value', () => {
      withPromote([false, null]);
      render(<CrdAdminLicensingPage />);
      const headers = screen.getAllByRole('columnheader').map(header => header.textContent);
      expect(headers.slice(-3)).toEqual(['licensing.columns.plans', 'columns.promoteHeader', 'table.actions']);
      expect(screen.getByRole('checkbox', { name: promoteLabel('Climate Lab') })).not.toBeChecked();
      // A row without a value renders no control.
      expect(screen.queryByRole('checkbox', { name: promoteLabel('Demo Space') })).toBeNull();
    });

    test('is hidden, header included, when every row has a null promote', () => {
      withPromote([null, null]);
      render(<CrdAdminLicensingPage />);
      expect(screen.queryByRole('columnheader', { name: 'columns.promoteHeader' })).toBeNull();
      expect(screen.queryByRole('checkbox')).toBeNull();
    });

    test('clicking the box sends the promote mutation for that space', async () => {
      withPromote([true, false]);
      render(<CrdAdminLicensingPage />);
      await userEvent.click(screen.getByRole('checkbox', { name: promoteLabel('Climate Lab') }));
      expect(updatePromoteMock).toHaveBeenCalledWith({ variables: { spaceId: 's1', promote: false } });
    });

    test('a permission refusal notifies exactly once', async () => {
      withPromote([true, false]);
      updatePromoteMock.mockRejectedValueOnce({
        graphQLErrors: [{ message: 'nope', extensions: { code: 'FORBIDDEN_POLICY' } }],
      });
      render(<CrdAdminLicensingPage />);
      const box = screen.getByRole('checkbox', { name: promoteLabel('Demo Space') });
      await userEvent.click(box);
      await waitFor(() => expect(notify).toHaveBeenCalledWith('permissions.errorDenied', 'error'));
      expect(notify).toHaveBeenCalledTimes(1);
      expect(box).not.toBeChecked();
    });
  });
});
