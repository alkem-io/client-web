import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

// ---- Mocks ----

const startDirectChatMock = vi.fn();
vi.mock('@/main/crdPages/unifiedChat/useStartDirectChat', () => ({
  useStartDirectChat: (userId: string | undefined) => ({
    startDirectChat: () => startDirectChatMock(userId),
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

import { useOpenDirectChatHandler } from './useSendMessageHandler';

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

    expect(toastErrorMock).toHaveBeenCalledWith('common.messagePopover.openChatError');
  });

  test('throws when no recipient is loaded', async () => {
    const { result } = renderHook(() => useOpenDirectChatHandler({ recipientUserId: undefined }));
    await expect(result.current.onOpenChat()).rejects.toThrow('Recipient user not loaded.');
    expect(startDirectChatMock).not.toHaveBeenCalled();
  });
});
