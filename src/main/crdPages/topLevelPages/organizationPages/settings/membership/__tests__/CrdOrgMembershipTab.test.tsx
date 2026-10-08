import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleName, SpaceLevel, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import contributorSettingsEn from '@/crd/i18n/contributorSettings/contributorSettings.en.json';

const mockOrganizationContext = vi.fn();
const mockRolesQuery = vi.fn();
const mockRefetch = vi.fn();
const mockFetchSpaceDetails = vi.fn();
const mockRemoveRoleFromOrganization = vi.fn();
const mockNotify = vi.fn();

vi.mock('@/domain/community/organization/hooks/useOrganizationContext', () => ({
  useOrganizationContext: () => mockOrganizationContext(),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useRolesOrganizationQuery: (options: unknown) => mockRolesQuery(options),
  useSpaceContributionDetailsLazyQuery: () => [mockFetchSpaceDetails],
  useRemoveRoleFromOrganizationMutation: () => [mockRemoveRoleFromOrganization, { loading: false }],
}));

vi.mock('@/core/ui/notifications/useNotification', () => ({
  useNotification: () => mockNotify,
}));

vi.mock('../../../../userPages/settings/membership/useMembershipEnrichment', () => ({
  default: () => new Map(),
}));

import CrdOrgMembershipTab from '../CrdOrgMembershipTab';

const en = contributorSettingsEn.org.membership;

const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    resources: { en: { 'crd-contributorSettings': contributorSettingsEn } },
    interpolation: { escapeValue: false },
  });
});

const ROLES_DATA = {
  rolesOrganization: {
    id: 'roles-org-1',
    spaces: [
      {
        id: 'space-a',
        roles: [RoleName.Member],
        displayName: 'Garden Space',
        visibility: SpaceVisibility.Active,
        subspaces: [{ id: 'sub-a-1', displayName: 'Garden Patch', roles: [RoleName.Member], level: SpaceLevel.L1 }],
      },
    ],
  },
};

const renderTab = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <CrdOrgMembershipTab />
    </I18nextProvider>
  );

beforeEach(() => {
  mockOrganizationContext.mockReset().mockReturnValue({ organizationId: 'org-1', loading: false });
  mockRefetch.mockReset().mockResolvedValue({});
  mockRolesQuery.mockReset().mockReturnValue({ data: ROLES_DATA, loading: false, refetch: mockRefetch });
  mockFetchSpaceDetails
    .mockReset()
    .mockResolvedValue({ data: { lookup: { space: { about: { membership: { roleSetID: 'rs-sub' } } } } } });
  mockRemoveRoleFromOrganization.mockReset().mockResolvedValue({ data: {} });
  mockNotify.mockReset();
});

const openLeaveDialogFor = async (user: ReturnType<typeof userEvent.setup>, cardIndex: number) => {
  const triggers = screen.getAllByRole('button', { name: contributorSettingsEn.shared.account.kebabAriaLabel });
  await user.click(triggers[cardIndex]);
  await user.click(screen.getByRole('menuitem', { name: 'Leave Subspace' }));
  return screen.findByRole('alertdialog');
};

describe('CrdOrgMembershipTab', () => {
  it('shows the skeleton, never the empty caption, while the organization is still resolving', () => {
    mockOrganizationContext.mockReturnValue({ organizationId: '', loading: true });
    mockRolesQuery.mockReturnValue({ data: undefined, loading: false, refetch: mockRefetch });

    const { container } = renderTab();

    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull();
    expect(mockRolesQuery).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
    expect(screen.queryByText(en.empty)).not.toBeInTheDocument();
    expect(screen.queryByText(en.title)).not.toBeInTheDocument();
  });

  it('shows the skeleton, never the empty caption, while the organization is unresolved even if the context reports not loading', () => {
    mockOrganizationContext.mockReturnValue({ organizationId: '', loading: false });
    mockRolesQuery.mockReturnValue({ data: undefined, loading: false, refetch: mockRefetch });

    const { container } = renderTab();

    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull();
    expect(mockRolesQuery).toHaveBeenCalledWith(expect.objectContaining({ skip: true }));
    expect(screen.queryByText(en.empty)).not.toBeInTheDocument();
    expect(screen.queryByText(en.title)).not.toBeInTheDocument();
  });

  it('shows the empty caption once resolved with no memberships', () => {
    mockRolesQuery.mockReturnValue({
      data: { rolesOrganization: { id: 'roles-org-1', spaces: [] } },
      loading: false,
      refetch: mockRefetch,
    });

    renderTab();

    expect(screen.getByText(en.empty)).toBeInTheDocument();
  });

  it('renders a card for the space and one for its subspace', () => {
    renderTab();

    expect(screen.getByText(en.title)).toBeInTheDocument();
    expect(screen.getByText('Garden Space')).toBeInTheDocument();
    expect(screen.getByText('Garden Patch')).toBeInTheDocument();
    expect(screen.getByText('Showing 2 of 2 memberships')).toBeInTheDocument();
  });

  it('confirms before leaving, then removes the organization from the subspace role set and reports success', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    renderTab();

    const dialog = await openLeaveDialogFor(user, 1);
    expect(dialog).toHaveTextContent('Garden Patch');
    expect(mockRemoveRoleFromOrganization).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: en.leave.dialogConfirm }));

    await waitFor(() => expect(mockNotify).toHaveBeenCalledWith(en.leave.success, 'success'));
    expect(mockFetchSpaceDetails).toHaveBeenCalledWith({ variables: { spaceId: 'sub-a-1' } });
    expect(mockRemoveRoleFromOrganization).toHaveBeenCalledWith({
      variables: { contributorId: 'org-1', roleSetId: 'rs-sub', role: RoleName.Member },
      awaitRefetchQueries: true,
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('keeps the dialog open and busy, its buttons disabled, while the removal is in flight', async () => {
    let settleRemoval: (value: unknown) => void = () => {};
    mockRemoveRoleFromOrganization.mockReturnValue(
      new Promise(resolve => {
        settleRemoval = resolve;
      })
    );
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    renderTab();

    await openLeaveDialogFor(user, 1);
    await user.click(screen.getByRole('button', { name: en.leave.dialogConfirm }));

    await waitFor(() => expect(mockRemoveRoleFromOrganization).toHaveBeenCalledTimes(1));
    const dialog = screen.getByRole('alertdialog');
    const confirm = within(dialog).getByRole('button', { name: en.leave.dialogConfirm });
    expect(confirm).toBeDisabled();
    expect(confirm).toHaveAttribute('aria-busy', 'true');
    expect(within(dialog).getByRole('button', { name: 'dialogs.cancel' })).toBeDisabled();

    await user.keyboard('{Escape}');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(mockNotify).not.toHaveBeenCalled();

    settleRemoval({ data: {} });

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(mockNotify).toHaveBeenCalledWith(en.leave.success, 'success');
    expect(mockRemoveRoleFromOrganization).toHaveBeenCalledTimes(1);
  });

  it('keeps the dialog open and busy while the role set is still being resolved', async () => {
    let settleLookup: (value: unknown) => void = () => {};
    mockFetchSpaceDetails.mockReturnValue(
      new Promise(resolve => {
        settleLookup = resolve;
      })
    );
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    renderTab();

    await openLeaveDialogFor(user, 1);
    await user.click(screen.getByRole('button', { name: en.leave.dialogConfirm }));

    const confirm = within(screen.getByRole('alertdialog')).getByRole('button', { name: en.leave.dialogConfirm });
    expect(confirm).toBeDisabled();
    expect(confirm).toHaveAttribute('aria-busy', 'true');
    expect(mockRemoveRoleFromOrganization).not.toHaveBeenCalled();

    settleLookup({ data: { lookup: { space: { about: { membership: { roleSetID: 'rs-sub' } } } } } });

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(mockRemoveRoleFromOrganization).toHaveBeenCalledTimes(1);
    expect(mockNotify).toHaveBeenCalledWith(en.leave.success, 'success');
  });

  it('reports an error, never success, when the leave is rejected', async () => {
    mockRemoveRoleFromOrganization.mockRejectedValue(new Error('Authorization: unable to grant'));
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    renderTab();

    await openLeaveDialogFor(user, 1);
    await user.click(screen.getByRole('button', { name: en.leave.dialogConfirm }));

    await waitFor(() => expect(mockNotify).toHaveBeenCalledWith(en.leave.error, 'error'));
    expect(mockNotify).not.toHaveBeenCalledWith(en.leave.success, 'success');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('reports an error without sending the mutation when the role set cannot be resolved', async () => {
    mockFetchSpaceDetails.mockResolvedValue({ data: { lookup: { space: null } } });
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    renderTab();

    await openLeaveDialogFor(user, 1);
    await user.click(screen.getByRole('button', { name: en.leave.dialogConfirm }));

    await waitFor(() => expect(mockNotify).toHaveBeenCalledWith(en.leave.error, 'error'));
    expect(mockRemoveRoleFromOrganization).not.toHaveBeenCalled();
    expect(mockNotify).not.toHaveBeenCalledWith(en.leave.success, 'success');
  });

  it('cancelling the dialog sends nothing', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    renderTab();

    await openLeaveDialogFor(user, 1);
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(mockFetchSpaceDetails).not.toHaveBeenCalled();
    expect(mockRemoveRoleFromOrganization).not.toHaveBeenCalled();
    expect(mockNotify).not.toHaveBeenCalled();
  });
});
