import { ApolloError } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useResendPlatformInvitationAction } from './useResendPlatformInvitationAction';

const notify = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));

const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>(res => {
    resolve = res;
  });
  return { promise, resolve };
};

describe('useResendPlatformInvitationAction', () => {
  beforeEach(() => {
    notify.mockReset();
  });

  test('success toasts success and clears the in-flight id', async () => {
    const resend = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useResendPlatformInvitationAction(resend));

    await act(async () => {
      result.current.onResend('pi-1');
    });

    expect(resend).toHaveBeenCalledWith('pi-1');
    await waitFor(() => expect(notify).toHaveBeenCalledWith('community.pendingMemberships.resendSuccess', 'success'));
    await waitFor(() => expect(result.current.resendingIds.size).toBe(0));
  });

  test('the throttled refusal is an error-severity toast', async () => {
    const resend = vi.fn().mockRejectedValue(
      new ApolloError({
        graphQLErrors: [{ message: 'slow down', extensions: { code: 'ROLESET_INVITATION_RESEND_THROTTLED' } } as never],
      })
    );
    const { result } = renderHook(() => useResendPlatformInvitationAction(resend));

    await act(async () => {
      result.current.onResend('pi-1');
    });

    await waitFor(() => expect(notify).toHaveBeenCalledWith('community.pendingMemberships.resendThrottled', 'error'));
  });

  test('any other failure is an error toast', async () => {
    const resend = vi.fn().mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useResendPlatformInvitationAction(resend));

    await act(async () => {
      result.current.onResend('pi-1');
    });

    await waitFor(() => expect(notify).toHaveBeenCalledWith('community.pendingMemberships.resendError', 'error'));
  });

  test('rows resend independently while another row is in flight, and a row is not resent twice', async () => {
    const first = deferred();
    const resend = vi.fn((id: string) => (id === 'pi-1' ? first.promise : Promise.resolve()));
    const { result } = renderHook(() => useResendPlatformInvitationAction(resend));

    await act(async () => {
      result.current.onResend('pi-1');
    });
    expect(result.current.resendingIds.has('pi-1')).toBe(true);
    expect(result.current.resendingIds.has('pi-2')).toBe(false);

    await act(async () => {
      result.current.onResend('pi-2');
      result.current.onResend('pi-1');
    });

    expect(resend).toHaveBeenCalledTimes(2);
    expect(resend).toHaveBeenCalledWith('pi-2');
    await waitFor(() => expect(result.current.resendingIds.has('pi-2')).toBe(false));
    expect(result.current.resendingIds.has('pi-1')).toBe(true);

    await act(async () => {
      first.resolve();
    });
    await waitFor(() => expect(result.current.resendingIds.size).toBe(0));
  });
});
