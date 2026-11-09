import { ApolloError } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { afterEach, describe, expect, test, vi } from 'vitest';

// ---- Mocks ----

const startDirectChatMock = vi.fn();
vi.mock('@/main/crdPages/unifiedChat/useStartDirectChat', () => ({
  useStartDirectChat: (userId: string | undefined) => ({
    startDirectChat: (id = userId) => startDirectChatMock(id),
  }),
}));

const sendMessageToUsersMock = vi.fn();
const sendMessageToOrganizationMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSendMessageToUsersMutation: () => [sendMessageToUsersMock, { loading: false }],
  useSendMessageToOrganizationMutation: () => [sendMessageToOrganizationMock, { loading: false }],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const toastErrorMock = vi.fn();
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: (...args: unknown[]) => toastErrorMock(...args) } }));

import { useMessageContributor, useOpenDirectChatHandler } from './useSendMessageHandler';

describe('useOpenDirectChatHandler (US1 — profile Message → open 1:1 chat)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('opens/focuses the direct chat WITHOUT sending a message (FR-001)', async () => {
    startDirectChatMock.mockResolvedValue({ conversationId: 'conv-1', roomId: 'room-1' });

    const { result } = renderHook(() => useOpenDirectChatHandler({ recipientUserId: 'user-2' }));
    await result.current.onOpenChat();

    expect(startDirectChatMock).toHaveBeenCalledWith('user-2');
    expect(sendMessageToUsersMock).not.toHaveBeenCalled();
  });

  test('reuses an existing conversation (dedup) — startDirectChat is the single seam', async () => {
    // startDirectChat dedups server-side; the handler always routes through it
    // and opens/focuses whatever conversation it returns (existing or new).
    startDirectChatMock.mockResolvedValue({ conversationId: 'existing-conv', roomId: 'existing-room' });

    const { result } = renderHook(() => useOpenDirectChatHandler({ recipientUserId: 'user-2' }));
    await result.current.onOpenChat();

    expect(startDirectChatMock).toHaveBeenCalledTimes(1);
  });

  test('surfaces an error toast when the chat cannot be opened', async () => {
    startDirectChatMock.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useOpenDirectChatHandler({ recipientUserId: 'user-2' }));
    await result.current.onOpenChat();

    expect(toastErrorMock).toHaveBeenCalledWith('apollo.errors.UNSPECIFIED');
  });

  test('opens the chat with a call-time recipient when the hook has none', async () => {
    startDirectChatMock.mockResolvedValue({ conversationId: 'conv-9', roomId: 'room-9' });

    const { result } = renderHook(() => useOpenDirectChatHandler({ recipientUserId: undefined }));
    await result.current.onOpenChat('user-9');

    expect(startDirectChatMock).toHaveBeenCalledWith('user-9');
  });

  test('a MESSAGING_NOT_ENABLED refusal shows exactly one messaging-disabled toast', async () => {
    startDirectChatMock.mockRejectedValue(
      new ApolloError({
        graphQLErrors: [new GraphQLError('not enabled', { extensions: { code: 'MESSAGING_NOT_ENABLED' } })],
      })
    );

    const { result } = renderHook(() => useOpenDirectChatHandler({ recipientUserId: 'user-2' }));
    await result.current.onOpenChat();

    expect(toastErrorMock).toHaveBeenCalledTimes(1);
    expect(toastErrorMock).toHaveBeenCalledWith('apollo.errors.MESSAGING_NOT_ENABLED');
  });

  test('throws when no recipient is loaded', async () => {
    const { result } = renderHook(() => useOpenDirectChatHandler({ recipientUserId: undefined }));
    await expect(result.current.onOpenChat()).rejects.toThrow('Recipient user not loaded.');
    expect(startDirectChatMock).not.toHaveBeenCalled();
  });
});

describe('useMessageContributor (hover card Message action)', () => {
  afterEach(() => vi.clearAllMocks());

  test('opens a direct chat with the clicked contributor', async () => {
    startDirectChatMock.mockResolvedValue({ conversationId: 'conv-3', roomId: 'room-3' });

    const { result } = renderHook(() => useMessageContributor());
    result.current({ id: 'user-3' });

    await vi.waitFor(() => expect(startDirectChatMock).toHaveBeenCalledWith('user-3'));
  });
});
