import { ApolloError } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

const refetch = vi.fn().mockResolvedValue(undefined);
const assignRoleToUser = vi.fn().mockResolvedValue(undefined);
const removeRoleFromUser = vi.fn().mockResolvedValue(undefined);
const applicationStateChange = vi.fn().mockResolvedValue(undefined);
const deleteInvitation = vi.fn().mockResolvedValue(undefined);
const refetchApplicationsAndInvitations = vi.fn().mockResolvedValue(undefined);
const notify = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));
vi.mock('@/main/crdPages/permissions/usePermissionReasonText', () => ({ default: () => () => 'no permission' }));
vi.mock('@/domain/access/permissions/useActionPermission', () => ({
  default: () => ({ allowed: true, reason: undefined }),
}));
const useRoleSetManagerRolesAssignmentMock = vi.fn((_params: unknown) => ({
  assignRoleToUser,
  removeRoleFromUser,
  loading: false,
}));
vi.mock('@/domain/access/RoleSetManager/RolesAssignment/useRoleSetManagerRolesAssignment', () => ({
  default: (params: unknown) => useRoleSetManagerRolesAssignmentMock(params),
}));

let applications: unknown[] = [];
let invitations: unknown[] = [];
const useRoleSetApplicationsAndInvitationsMock = vi.fn((_params: unknown) => ({
  applications,
  invitations,
  applicationStateChange,
  deleteInvitation,
  refetch: refetchApplicationsAndInvitations,
}));
vi.mock('@/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations', () => ({
  default: (params: unknown) => useRoleSetApplicationsAndInvitationsMock(params),
}));

const roleLimitError = (message: string) =>
  new ApolloError({
    graphQLErrors: [{ message, extensions: { code: 'ROLESET_POLICY_ROLE_LIMITS_VIOLATED' } } as never],
  });
const forbiddenError = () =>
  new ApolloError({ graphQLErrors: [{ message: 'Forbidden', extensions: { code: 'FORBIDDEN' } } as never] });

const associateRow = {
  role: RoleName.Associate,
  users: [{ id: 'u-1', profile: { displayName: 'Ada Lovelace' } }],
};
const ownerRow = { role: RoleName.Owner, users: [{ id: 'u-1', profile: { displayName: 'Ada Lovelace' } }] };
let usersInRoles: unknown[] = [associateRow];

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useOrgAssociatesTabQuery: () => ({
    data: { lookup: { roleSet: { usersInRoles, authorization: { myPrivileges: ['GRANT'] } } } },
    loading: false,
    refetch,
  }),
}));

import { useOrgAssociatesTabData } from './useOrgAssociatesTabData';

const render = () => renderHook(() => useOrgAssociatesTabData('rs-1'));

beforeEach(() => {
  vi.clearAllMocks();
  usersInRoles = [associateRow];
  applications = [];
  invitations = [];
});

describe('useOrgAssociatesTabData — removing every role (the R-13 mitigation)', () => {
  it('cascades Owner then Admin then Associate, so no intermediate state violates the role invariants', async () => {
    usersInRoles = [
      associateRow,
      { role: RoleName.Admin, users: [{ id: 'u-1', profile: { displayName: 'Ada Lovelace' } }] },
      ownerRow,
    ];
    const { result } = render();

    act(() => result.current.onRequestRemoveAll('u-1', 'Ada Lovelace'));
    await act(async () => {
      await result.current.onConfirm();
    });

    expect(removeRoleFromUser.mock.calls.map(c => c[1])).toEqual([RoleName.Owner, RoleName.Admin, RoleName.Associate]);
  });

  it('skips roles the person does not hold', async () => {
    usersInRoles = [ownerRow];
    const { result } = render();

    act(() => result.current.onRequestRemoveAll('u-1', 'Ada Lovelace'));
    await act(async () => {
      await result.current.onConfirm();
    });

    expect(removeRoleFromUser.mock.calls.map(c => c[1])).toEqual([RoleName.Owner]);
  });

  it('never removes anything until the confirmation is answered', () => {
    const { result } = render();
    act(() => result.current.onRequestRemoveAll('u-1', 'Ada Lovelace'));

    expect(result.current.pendingConfirmation).toEqual({
      kind: 'removeAll',
      id: 'u-1',
      displayName: 'Ada Lovelace',
    });
    expect(removeRoleFromUser).not.toHaveBeenCalled();
  });
});

describe('useOrgAssociatesTabData — role-limit refusals are readable, not generic', () => {
  // The exact server text (role.set.service.ts): the role token is the enum VALUE, lower-case.
  it.each([
    ["Max limit of users reached for role 'admin': 6, cannot assign new user.", 'limitAdmin'],
    ["Max limit of users reached for role 'owner': 3, cannot assign new user.", 'limitOwner'],
    ["Min limit of users reached for role 'owner': 1, cannot remove user.", 'minOwner'],
  ])('maps %s to %s and raises no generic toast', async (message, expected) => {
    // A real ApolloError: the hook narrows on `instanceof`, so a shaped plain
    // object would take the generic-toast path and pass a weaker assertion.
    removeRoleFromUser.mockRejectedValueOnce(roleLimitError(message));
    const { result } = render();

    await act(async () => {
      await result.current.onToggleRole('u-1', 'Owner', false).catch(() => undefined);
    });

    await waitFor(() => expect(result.current.roleLimitError).toBe(expected));
    expect(notify).not.toHaveBeenCalled();
  });

  it('says which limit was hit when removing the last owner from the organisation is refused', async () => {
    usersInRoles = [ownerRow];
    removeRoleFromUser.mockRejectedValueOnce(
      roleLimitError("Min limit of users reached for role 'owner': 1, cannot remove user.")
    );
    const { result } = render();

    act(() => result.current.onRequestRemoveAll('u-1', 'Ada Lovelace'));
    await act(async () => {
      await result.current.onConfirm();
    });

    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('org.associates.errors.minOwner', 'error');
  });

  it('still reports an unrelated remove failure generically, once', async () => {
    usersInRoles = [ownerRow];
    removeRoleFromUser.mockRejectedValueOnce(new Error('nope'));
    const { result } = render();

    act(() => result.current.onRequestRemoveAll('u-1', 'Ada Lovelace'));
    await act(async () => {
      await result.current.onConfirm();
    });

    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('org.associates.editor.removeError', 'error');
  });
});

describe('useOrgAssociatesTabData — exactly one message per failure', () => {
  it('owns the error handling of every mutation it runs, so the global link stays quiet', () => {
    render();

    expect(useRoleSetManagerRolesAssignmentMock).toHaveBeenCalledWith(
      expect.objectContaining({ roleSetId: 'rs-1', context: { skipGlobalErrorHandler: true } })
    );
    expect(useRoleSetApplicationsAndInvitationsMock).toHaveBeenCalledWith(
      expect.objectContaining({ roleSetId: 'rs-1', mutationContext: { skipGlobalErrorHandler: true } })
    );
  });

  it('adds nothing on an authorization refusal — the role assignment wrapper already toasted', async () => {
    usersInRoles = [ownerRow];
    removeRoleFromUser.mockRejectedValueOnce(forbiddenError()).mockRejectedValueOnce(forbiddenError());
    const { result } = render();

    await act(async () => {
      await result.current.onToggleRole('u-1', 'Owner', false).catch(() => undefined);
    });
    act(() => result.current.onRequestRemoveAll('u-1', 'Ada Lovelace'));
    await act(async () => {
      await result.current.onConfirm();
    });

    expect(removeRoleFromUser).toHaveBeenCalledTimes(2);
    expect(notify).not.toHaveBeenCalled();
  });

  it('toasts once when approving an application fails', async () => {
    applications = [
      {
        id: 'app-1',
        state: 'new',
        createdDate: '2026-09-01T00:00:00.000Z',
        contributorType: 'USER',
        actor: { profile: { displayName: 'Grace Hopper' } },
      },
    ];
    applicationStateChange.mockRejectedValueOnce(new Error('nope'));
    const { result } = render();

    await act(async () => {
      result.current.onPendingApprove('app-1');
    });

    await waitFor(() => expect(notify).toHaveBeenCalledTimes(1));
    expect(notify).toHaveBeenCalledWith('org.associates.pending.actionError', 'error');
  });
});

describe('useOrgAssociatesTabData — transient rows stay listed with actions disabled', () => {
  it('lists an approving application and an accepting invitation without any action', () => {
    applications = [
      {
        id: 'app-approving',
        state: 'approving',
        createdDate: '2026-09-01T00:00:00.000Z',
        contributorType: 'USER',
        actor: { profile: { displayName: 'Grace Hopper' } },
      },
    ];
    invitations = [
      {
        id: 'inv-accepting',
        state: 'accepting',
        createdDate: '2026-09-01T00:00:00.000Z',
        contributorType: 'USER',
        extraRoles: [],
        actor: { profile: { displayName: 'Alan Turing' } },
      },
    ];
    const { result } = render();

    const approving = result.current.pendingMemberships.find(m => m.id === 'app-approving');
    expect(approving).toMatchObject({ state: 'approving', canApprove: false, canReject: false, canDelete: false });
    const accepting = result.current.pendingMemberships.find(m => m.id === 'inv-accepting');
    expect(accepting).toMatchObject({ state: 'accepting', canApprove: false, canReject: false, canDelete: false });
  });
});

describe('useOrgAssociatesTabData — pending rows dispatch on what the row IS', () => {
  beforeEach(() => {
    applications = [
      {
        id: 'app-1',
        state: 'new',
        createdDate: '2026-09-01T00:00:00.000Z',
        contributorType: 'USER',
        actor: { profile: { displayName: 'Grace Hopper' } },
      },
    ];
    invitations = [
      {
        id: 'inv-1',
        state: 'invited',
        createdDate: '2026-09-01T00:00:00.000Z',
        contributorType: 'USER',
        extraRoles: [],
        actor: { profile: { displayName: 'Alan Turing' } },
      },
    ];
  });

  it('rejects an application through the application mutation, never deleteInvitation', async () => {
    const { result } = render();

    act(() => result.current.onPendingReject('app-1'));
    await act(async () => {
      await result.current.onConfirm();
    });

    expect(applicationStateChange).toHaveBeenCalledWith('app-1', expect.anything());
    expect(deleteInvitation).not.toHaveBeenCalled();
  });

  it('revokes an invitation through deleteInvitation', async () => {
    const { result } = render();

    act(() => result.current.onPendingRevoke('inv-1'));
    await act(async () => {
      await result.current.onConfirm();
    });

    expect(deleteInvitation).toHaveBeenCalledWith('inv-1');
    expect(applicationStateChange).not.toHaveBeenCalled();
  });

  it('offers no revoke affordance on an application row', () => {
    const { result } = render();
    const applicationRow = result.current.pendingMemberships.find(m => m.id === 'app-1');

    expect(applicationRow?.canDelete).toBe(false);
    expect(applicationRow?.canReject).toBe(true);
  });

  it('toasts instead of leaving the admin clicking into silence when the mutation fails', async () => {
    deleteInvitation.mockRejectedValueOnce(new Error('nope'));
    const { result } = render();

    act(() => result.current.onPendingRevoke('inv-1'));
    await act(async () => {
      await result.current.onConfirm();
    });

    expect(notify).toHaveBeenCalledWith('org.associates.pending.actionError', 'error');
  });
});
