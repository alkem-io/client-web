import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const notifyMock = vi.fn();
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notifyMock }));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useOrgInvitationsQuery: () => ({ data: undefined, loading: false, refetch: vi.fn() }),
}));

const acceptInvitationMock = vi.fn();
const rejectInvitationMock = vi.fn();
vi.mock('@/domain/community/invitations/useInvitationActions', () => ({
  default: () => ({
    acceptInvitation: acceptInvitationMock,
    rejectInvitation: rejectInvitationMock,
    accepting: false,
    rejecting: false,
  }),
}));

vi.mock('./orgInvitationsMapper', () => ({
  mapOrgInvitations: () => [{ id: 'inv-1', spaceDisplayName: 'Space One' }],
}));

import { useOrgInvitationsTabData } from './useOrgInvitationsTabData';

/**
 * A revoked invitation (or an admin demoted between render and click) fails
 * with FORBIDDEN / FORBIDDEN_POLICY, both of which sit in
 * EXCLUDE_FROM_GLOBAL_HANDLER_ERRORS — so the global Apollo error link shows
 * nothing. Without the local catch these rejections were dropped on the floor:
 * the row stayed put and the user got no feedback at all.
 */
describe('useOrgInvitationsTabData — mutation failures are surfaced', () => {
  afterEach(() => vi.clearAllMocks());

  it('toasts when declining fails', async () => {
    rejectInvitationMock.mockRejectedValue(new Error('FORBIDDEN_POLICY'));
    const { result } = renderHook(() => useOrgInvitationsTabData('org-1'));

    await act(() => result.current.onDecline('inv-1'));

    expect(rejectInvitationMock).toHaveBeenCalledWith('inv-1');
    await waitFor(() => expect(notifyMock).toHaveBeenCalledWith('org.invitations.errorToast', 'error'));
  });

  it('toasts when accepting fails', async () => {
    acceptInvitationMock.mockRejectedValue(new Error('FORBIDDEN_POLICY'));
    const { result } = renderHook(() => useOrgInvitationsTabData('org-1'));

    act(() => result.current.onRequestAccept('inv-1'));
    await act(async () => {
      result.current.acceptConfirm.onConfirm();
    });

    expect(acceptInvitationMock).toHaveBeenCalledWith('inv-1', '');
    await waitFor(() => expect(notifyMock).toHaveBeenCalledWith('org.invitations.errorToast', 'error'));
  });

  it('does not toast when the mutation succeeds', async () => {
    rejectInvitationMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useOrgInvitationsTabData('org-1'));

    await act(() => result.current.onDecline('inv-1'));

    expect(notifyMock).not.toHaveBeenCalled();
  });
});
