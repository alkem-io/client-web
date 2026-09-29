import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleName } from '@/core/apollo/generated/graphql-schema';

const runEvent = vi.fn();
const notify = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { role?: string }) => (options?.role ? `${key}:${options.role}` : key),
  }),
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  OrganizationInfoDocument: 'OrganizationInfoDocument',
  useInvitationStateEventMutation: () => [runEvent, { loading: false }],
  refetchUserPendingMembershipsQuery: () => ({ query: 'UserPendingMemberships' }),
  refetchPendingInvitationsCountQuery: () => ({ query: 'PendingInvitationsCount' }),
}));

import { useOrgInvitationResponse } from './useOrgInvitationResponse';

const accepted = (extraRolesWithheld: RoleName[] = []) => ({
  data: { eventOnInvitation: { id: 'x', extraRolesWithheld } },
});

beforeEach(() => {
  vi.clearAllMocks();
  runEvent.mockResolvedValue(accepted());
});

describe('useOrgInvitationResponse — the withheld notice belongs to one answer', () => {
  it('never carries the previous invitation’s warning into the next answer', async () => {
    const onSettled = vi.fn();
    const { result } = renderHook(() => useOrgInvitationResponse(onSettled));

    runEvent.mockResolvedValueOnce(accepted([RoleName.Admin]));
    await act(async () => {
      await result.current.onAccept('inv-a');
    });
    expect(result.current.withheldNotice).toBe(
      'orgProfile.invitationDialog.withheld:orgProfile.invitationDialog.roleName.admin'
    );
    // The toast outlives the prop-driven close, so the downgrade is never silent.
    expect(notify).toHaveBeenCalledWith(result.current.withheldNotice, 'warning');
    expect(onSettled).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.onAccept('inv-b');
    });
    expect(result.current.withheldNotice).toBeUndefined();
    expect(onSettled).toHaveBeenCalledTimes(2);
  });

  it('hides a notice while a different invitation is on screen', async () => {
    let currentId: string | undefined = 'inv-a';
    const { result, rerender } = renderHook(() => useOrgInvitationResponse(vi.fn(), currentId));

    runEvent.mockResolvedValueOnce(accepted([RoleName.Owner]));
    await act(async () => {
      await result.current.onAccept('inv-a');
    });
    expect(result.current.withheldNotice).toBeDefined();

    currentId = 'inv-b';
    rerender();
    expect(result.current.withheldNotice).toBeUndefined();
  });

  it('clears explicitly from the dialog close as before', async () => {
    const { result } = renderHook(() => useOrgInvitationResponse(vi.fn()));

    runEvent.mockResolvedValueOnce(accepted([RoleName.Admin]));
    await act(async () => {
      await result.current.onAccept('inv-a');
    });
    act(() => result.current.clearWithheldNotice());

    expect(result.current.withheldNotice).toBeUndefined();
  });
});

describe('useOrgInvitationResponse — exactly one message per failure', () => {
  it('owns its error handling and toasts once when the answer fails', async () => {
    runEvent.mockRejectedValueOnce(new Error('nope'));
    const onSettled = vi.fn();
    const { result } = renderHook(() => useOrgInvitationResponse(onSettled));

    await act(async () => {
      await result.current.onDecline('inv-a');
    });

    expect(runEvent).toHaveBeenCalledWith(expect.objectContaining({ context: { skipGlobalErrorHandler: true } }));
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith('orgProfile.invitationDialog.declineError', 'error');
    expect(onSettled).not.toHaveBeenCalled();
  });
});

describe('useOrgInvitationResponse — every surface showing the invitation is refreshed', () => {
  it('refetches OrganizationInfo, so the profile does not keep a stale "Respond to invitation"', async () => {
    const { result } = renderHook(() => useOrgInvitationResponse(vi.fn()));

    await act(async () => {
      await result.current.onAccept('inv-a');
    });

    expect(runEvent).toHaveBeenCalledWith(
      expect.objectContaining({ refetchQueries: expect.arrayContaining(['OrganizationInfoDocument']) })
    );
  });
});
