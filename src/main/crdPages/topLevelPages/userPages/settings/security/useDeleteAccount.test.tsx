import { ApolloError } from '@apollo/client';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter, useSearchParams } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useDeleteAccount from './useDeleteAccount';

const mockRunPreflight = vi.fn();
const mockDeleteUserMutation = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useAccountDeletionPreflightLazyQuery: () => [mockRunPreflight],
  useDeleteUserMutation: () => [mockDeleteUserMutation],
}));

vi.mock('@/core/routing/useNavigate', () => ({
  default: () => mockNavigate,
}));

const wrapperWithUrl =
  (url: string) =>
  ({ children }: PropsWithChildren) => <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>;

const useHarness = (userId: string | undefined, securityTabUrl: string) => {
  const result = useDeleteAccount(userId, securityTabUrl);
  const [searchParams] = useSearchParams();
  return { result, resumeParam: searchParams.get('resume') };
};

const freshCanDelete = {
  canDelete: true,
  sessionFresh: true,
  truncated: false,
  externalSubscriptionLinked: false,
  blockers: [],
  totals: [],
};

const freshBlocked = {
  canDelete: false,
  sessionFresh: true,
  truncated: false,
  externalSubscriptionLinked: false,
  blockers: [
    { kind: 'ACCOUNT_SPACE', resourceID: 'space-1', displayName: 'My Space', url: '/my-space', selfResolvable: true },
  ],
  totals: [{ kind: 'ACCOUNT_SPACE', total: 1 }],
};

const stale = { ...freshCanDelete, sessionFresh: false };

const REAUTH_ATTEMPTED_KEY = 'alkemio_delete_account_reauth_attempted';

describe('useDeleteAccount', () => {
  let assignSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    assignSpy = vi.fn();
    // `window.location.assign` drives the full-page OIDC redirect — jsdom's
    // native implementation throws "Not implemented: navigation", so it is
    // replaced with a spy for the duration of each test.
    Object.defineProperty(window, 'location', {
      value: { ...window.location, assign: assignSpy, origin: 'https://alkemio.test' },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it('opens the confirm dialog when the session is fresh and nothing blocks deletion', async () => {
    mockRunPreflight.mockResolvedValue({ data: { me: { accountDeletion: freshCanDelete } } });
    const { result } = renderHook(() => useHarness('user-1', '/user/me/settings/security'), {
      wrapper: wrapperWithUrl('/user/me/settings/security'),
    });

    await act(async () => result.current.result.onOpen());

    expect(result.current.result.dialog.kind).toBe('confirm');
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it('routes to the blocked dialog with the itemized answer when blockers exist', async () => {
    mockRunPreflight.mockResolvedValue({ data: { me: { accountDeletion: freshBlocked } } });
    const { result } = renderHook(() => useHarness('user-1', '/user/me/settings/security'), {
      wrapper: wrapperWithUrl('/user/me/settings/security'),
    });

    await act(async () => result.current.result.onOpen());

    expect(result.current.result.dialog).toMatchObject({
      kind: 'blocked',
      blockers: [{ displayName: 'My Space' }],
    });
  });

  it('routes a stale session to the OIDC BFF login BEFORE any dialog opens — never showing confirm on stale state', async () => {
    mockRunPreflight.mockResolvedValue({ data: { me: { accountDeletion: stale } } });
    const { result } = renderHook(() => useHarness('user-1', '/user/me/settings/security'), {
      wrapper: wrapperWithUrl('/user/me/settings/security'),
    });

    await act(async () => result.current.result.onOpen());

    expect(assignSpy).toHaveBeenCalledTimes(1);
    const target = assignSpy.mock.calls[0][0] as string;
    // The re-auth round trip must go through the BFF login route — the only
    // path whose callback re-mints the alkemio_session the server reads for
    // freshness. A Kratos-native login/browser redirect never does that.
    expect(target).toContain('/api/auth/oidc/login');
    expect(target).not.toContain('/ory/kratos/public');
    expect(target).toContain(encodeURIComponent('resume=delete-account'));
    // Never opens confirm — the dialog stays exactly where the preflight left it mid-redirect.
    expect(result.current.result.dialog.kind).not.toBe('confirm');
    // Sets the one-shot loop-guard marker so a resumed round trip that is
    // still stale can be told apart from a first attempt.
    expect(sessionStorage.getItem(REAUTH_ATTEMPTED_KEY)).toBe('1');
  });

  it("resumes on mount from a `?resume=delete-account` URL carrying this tab's marker, then strips the flag", async () => {
    sessionStorage.setItem(REAUTH_ATTEMPTED_KEY, '1');
    mockRunPreflight.mockResolvedValue({ data: { me: { accountDeletion: freshCanDelete } } });
    const { result } = renderHook(() => useHarness('user-1', '/user/me/settings/security'), {
      wrapper: wrapperWithUrl('/user/me/settings/security?resume=delete-account'),
    });

    await waitFor(() => expect(mockRunPreflight).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.resumeParam).toBeNull());
    await waitFor(() => expect(result.current.result.dialog.kind).toBe('confirm'));
    // A fresh session clears the loop-guard marker so a later stale session can retry once more.
    expect(sessionStorage.getItem(REAUTH_ATTEMPTED_KEY)).toBeNull();
  });

  it('ignores a `?resume=delete-account` URL with no matching marker — never runs the pre-flight or redirects', async () => {
    // No REAUTH_ATTEMPTED_KEY set: this simulates a link supplied some other
    // way than this tab's own redirectToReauth (e.g. sent to a signed-in
    // victim), which must not be able to kick off a forced re-login.
    const { result } = renderHook(() => useHarness('user-1', '/user/me/settings/security'), {
      wrapper: wrapperWithUrl('/user/me/settings/security?resume=delete-account'),
    });

    await waitFor(() => expect(result.current.resumeParam).toBeNull());
    expect(mockRunPreflight).not.toHaveBeenCalled();
    expect(assignSpy).not.toHaveBeenCalled();
    expect(result.current.result.dialog).toEqual({ kind: 'closed' });
  });

  it('a resumed pre-flight that is STILL stale stops instead of redirecting again — no infinite loop', async () => {
    sessionStorage.setItem(REAUTH_ATTEMPTED_KEY, '1');
    mockRunPreflight.mockResolvedValue({ data: { me: { accountDeletion: stale } } });
    const { result } = renderHook(() => useHarness('user-1', '/user/me/settings/security'), {
      wrapper: wrapperWithUrl('/user/me/settings/security?resume=delete-account'),
    });

    await waitFor(() => expect(mockRunPreflight).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.result.dialog.kind).toBe('reauth-failed'));
    // Exactly zero redirects: the ONE prior attempt is the marker already set above.
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it('a fresh, non-resumed open still redirects exactly once even with a stale marker left over from a prior session', async () => {
    // Simulates: the marker was set by a stale-session redirect, the user
    // signs in successfully, then re-opens the trigger normally (not via the
    // `?resume=` URL) — the pre-flight succeeding must clear the guard.
    sessionStorage.setItem(REAUTH_ATTEMPTED_KEY, '1');
    mockRunPreflight.mockResolvedValue({ data: { me: { accountDeletion: freshCanDelete } } });
    const { result } = renderHook(() => useHarness('user-1', '/user/me/settings/security'), {
      wrapper: wrapperWithUrl('/user/me/settings/security'),
    });

    await act(async () => result.current.result.onOpen());

    expect(result.current.result.dialog.kind).toBe('confirm');
    expect(sessionStorage.getItem(REAUTH_ATTEMPTED_KEY)).toBeNull();
  });

  it('on SESSION_REFRESH_REQUIRED from the mutation, redirects to re-auth instead of showing a generic error', async () => {
    mockRunPreflight.mockResolvedValue({ data: { me: { accountDeletion: freshCanDelete } } });
    mockDeleteUserMutation.mockRejectedValue(
      new ApolloError({
        graphQLErrors: [{ message: 'stale', extensions: { code: 'SESSION_REFRESH_REQUIRED' } } as never],
      })
    );
    const { result } = renderHook(() => useHarness('user-1', '/user/me/settings/security'), {
      wrapper: wrapperWithUrl('/user/me/settings/security'),
    });

    await act(async () => result.current.result.onOpen());
    await act(async () => result.current.result.onConfirm());

    expect(assignSpy).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('on ACCOUNT_DELETION_BLOCKED from the mutation (TOCTOU), re-runs the pre-flight and renders the fresh blocked answer', async () => {
    mockRunPreflight
      .mockResolvedValueOnce({ data: { me: { accountDeletion: freshCanDelete } } })
      .mockResolvedValueOnce({ data: { me: { accountDeletion: freshBlocked } } });
    mockDeleteUserMutation.mockRejectedValue(
      new ApolloError({
        graphQLErrors: [{ message: 'blocked', extensions: { code: 'ACCOUNT_DELETION_BLOCKED' } } as never],
      })
    );
    const { result } = renderHook(() => useHarness('user-1', '/user/me/settings/security'), {
      wrapper: wrapperWithUrl('/user/me/settings/security'),
    });

    await act(async () => result.current.result.onOpen());
    await act(async () => result.current.result.onConfirm());

    expect(mockRunPreflight).toHaveBeenCalledTimes(2);
    expect(result.current.result.dialog).toMatchObject({ kind: 'blocked' });
  });

  it('on success, deletes and navigates to the logout path', async () => {
    mockRunPreflight.mockResolvedValue({ data: { me: { accountDeletion: freshCanDelete } } });
    mockDeleteUserMutation.mockResolvedValue({ data: { deleteUser: { id: 'user-1' } } });
    const { result } = renderHook(() => useHarness('user-1', '/user/me/settings/security'), {
      wrapper: wrapperWithUrl('/user/me/settings/security'),
    });

    await act(async () => result.current.result.onOpen());
    await act(async () => result.current.result.onConfirm());

    expect(mockDeleteUserMutation).toHaveBeenCalledWith({ variables: { input: { ID: 'user-1' } } });
    expect(mockNavigate).toHaveBeenCalledWith('/logout');
  });

  it('ignores a close request that arrives while a deletion is in flight, so a rejected mutation still surfaces its error', async () => {
    // Reproduces the Radix AlertDialogAction race: its own onClick composes
    // the caller's onConfirm with an implicit onOpenChange(false), fired in
    // the SAME click. A close that were allowed to win here would leave
    // nothing rendering the dialog by the time the mutation rejects.
    mockRunPreflight.mockResolvedValue({ data: { me: { accountDeletion: freshCanDelete } } });
    let rejectMutation: (error: unknown) => void = () => {};
    mockDeleteUserMutation.mockReturnValue(new Promise((_resolve, reject) => (rejectMutation = reject)));
    const { result } = renderHook(() => useHarness('user-1', '/user/me/settings/security'), {
      wrapper: wrapperWithUrl('/user/me/settings/security'),
    });

    await act(async () => result.current.result.onOpen());
    act(() => {
      // onConfirm's synchronous portion (setDialog deleting:true) runs first,
      // then Radix's implicit close fires in the same tick — model both.
      result.current.result.onConfirm();
      result.current.result.onDialogOpenChange(false);
    });

    expect(result.current.result.dialog).toMatchObject({ kind: 'confirm', deleting: true });

    await act(async () => {
      rejectMutation(new Error('network error'));
      await Promise.resolve();
    });

    expect(result.current.result.dialog).toMatchObject({ kind: 'confirm', deleting: false, error: true });
  });

  it('cancelling closes the dialog without ever calling the mutation', async () => {
    mockRunPreflight.mockResolvedValue({ data: { me: { accountDeletion: freshCanDelete } } });
    const { result } = renderHook(() => useHarness('user-1', '/user/me/settings/security'), {
      wrapper: wrapperWithUrl('/user/me/settings/security'),
    });

    await act(async () => result.current.result.onOpen());
    act(() => result.current.result.onCancel());

    expect(result.current.result.dialog).toEqual({ kind: 'closed' });
    expect(mockDeleteUserMutation).not.toHaveBeenCalled();
  });
});
