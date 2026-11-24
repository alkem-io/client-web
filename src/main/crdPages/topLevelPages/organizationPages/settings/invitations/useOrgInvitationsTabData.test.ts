import { act, renderHook } from '@testing-library/react';
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
const useInvitationActionsMock = vi.fn();
vi.mock('@/domain/community/invitations/useInvitationActions', () => ({
  default: (params: unknown) => {
    useInvitationActionsMock(params);
    return {
      acceptInvitation: acceptInvitationMock,
      rejectInvitation: rejectInvitationMock,
      accepting: false,
      rejecting: false,
    };
  },
}));

vi.mock('./orgInvitationsMapper', () => ({
  mapOrgInvitations: () => [{ id: 'inv-1', spaceDisplayName: 'Space One' }],
}));

import { useOrgInvitationsTabData } from './useOrgInvitationsTabData';

/**
 * A revoked invitation (or an admin demoted between render and click) fails with a not-available
 * error. The global error handler reports a failed accept or decline, with the server's reason;
 * the tab only swallows the rejection so the confirmation flow ends cleanly.
 */
describe('useOrgInvitationsTabData — mutation failures are reported once, by the global handler', () => {
  afterEach(() => vi.clearAllMocks());

  it('leaves accept and decline to the global error handler', () => {
    renderHook(() => useOrgInvitationsTabData('org-1'));

    expect(useInvitationActionsMock.mock.calls[0][0]).not.toHaveProperty('mutationContext');
  });

  it('adds no message of its own when declining fails', async () => {
    rejectInvitationMock.mockRejectedValue(new Error('refused'));
    const { result } = renderHook(() => useOrgInvitationsTabData('org-1'));

    act(() => result.current.onRequestDecline('inv-1'));
    await act(async () => {
      result.current.declineConfirm.onConfirm();
    });

    expect(rejectInvitationMock).toHaveBeenCalledWith('inv-1');
    expect(notifyMock).not.toHaveBeenCalled();
    expect(result.current.declineConfirm.pendingId).toBeNull();
  });

  it('adds no message of its own when accepting fails', async () => {
    acceptInvitationMock.mockRejectedValue(new Error('refused'));
    const { result } = renderHook(() => useOrgInvitationsTabData('org-1'));

    act(() => result.current.onRequestAccept('inv-1'));
    await act(async () => {
      result.current.acceptConfirm.onConfirm();
    });

    expect(acceptInvitationMock).toHaveBeenCalledWith('inv-1', '');
    expect(notifyMock).not.toHaveBeenCalled();
    expect(result.current.acceptConfirm.pendingId).toBeNull();
  });

  it('does not decline until the confirmation is confirmed (Golden Rule 9)', async () => {
    // Declining is irreversible from this surface: the lifecycle has no
    // transition from `rejected` back to `invited`, so a single mis-click
    // would need a Space admin to archive and re-invite.
    rejectInvitationMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useOrgInvitationsTabData('org-1'));

    act(() => result.current.onRequestDecline('inv-1'));

    expect(rejectInvitationMock).not.toHaveBeenCalled();
    expect(result.current.declineConfirm.pendingId).toBe('inv-1');
    expect(result.current.declineConfirm.pendingSpaceName).toBe('Space One');

    act(() => result.current.declineConfirm.onCancel());

    expect(rejectInvitationMock).not.toHaveBeenCalled();
    expect(result.current.declineConfirm.pendingId).toBeNull();
  });

  it('does not toast when the mutation succeeds', async () => {
    rejectInvitationMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useOrgInvitationsTabData('org-1'));

    act(() => result.current.onRequestDecline('inv-1'));
    await act(async () => {
      result.current.declineConfirm.onConfirm();
    });

    expect(notifyMock).not.toHaveBeenCalled();
  });
});
