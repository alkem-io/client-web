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

describe('useDeleteAccount', () => {
  let assignSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    assignSpy = vi.fn();
    // `window.location.assign` drives the full-page Kratos redirect — jsdom's
    // native implementation throws "Not implemented: navigation", so it is
    // replaced with a spy for the duration of each test.
    Object.defineProperty(window, 'location', {
      value: { ...window.location, assign: assignSpy, origin: 'https://alkemio.test' },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('routes a stale session to Kratos refresh BEFORE any dialog opens — never showing confirm on stale state', async () => {
    mockRunPreflight.mockResolvedValue({ data: { me: { accountDeletion: stale } } });
    const { result } = renderHook(() => useHarness('user-1', '/user/me/settings/security'), {
      wrapper: wrapperWithUrl('/user/me/settings/security'),
    });

    await act(async () => result.current.result.onOpen());

    expect(assignSpy).toHaveBeenCalledTimes(1);
    const target = assignSpy.mock.calls[0][0] as string;
    expect(target).toContain('/ory/kratos/public/self-service/login/browser');
    expect(target).toContain('refresh=true');
    expect(target).toContain(encodeURIComponent('resume=delete-account'));
    // Never opens confirm — the dialog stays exactly where the preflight left it mid-redirect.
    expect(result.current.result.dialog.kind).not.toBe('confirm');
  });

  it('resumes on mount from a `?resume=delete-account` URL, then strips the flag', async () => {
    mockRunPreflight.mockResolvedValue({ data: { me: { accountDeletion: freshCanDelete } } });
    const { result } = renderHook(() => useHarness('user-1', '/user/me/settings/security'), {
      wrapper: wrapperWithUrl('/user/me/settings/security?resume=delete-account'),
    });

    await waitFor(() => expect(mockRunPreflight).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.resumeParam).toBeNull());
    await waitFor(() => expect(result.current.result.dialog.kind).toBe('confirm'));
  });

  it('on SESSION_REFRESH_REQUIRED from the mutation, redirects to Kratos refresh instead of showing a generic error', async () => {
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
