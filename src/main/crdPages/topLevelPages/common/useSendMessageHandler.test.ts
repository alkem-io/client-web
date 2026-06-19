import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

// ---- Mocks ----

const startDirectChatMock = vi.fn();
vi.mock('@/main/crdPages/unifiedChat/useStartDirectChat', () => ({
  useStartDirectChat: (userId: string | undefined) => ({
    startDirectChat: () => startDirectChatMock(userId),
  }),
}));

const sendMessageToRoomMock = vi.fn();
const sendMessageToOrganizationMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSendMessageToRoomMutation: () => [sendMessageToRoomMock, { loading: false }],
  useSendMessageToOrganizationMutation: () => [sendMessageToOrganizationMock, { loading: false }],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));

import { useSendMessageToUserHandler } from './useSendMessageHandler';

describe('useSendMessageToUserHandler (US1 — profile message → 1:1 chat)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('opens/creates the direct chat and sends the message into its room', async () => {
    startDirectChatMock.mockResolvedValue({ conversationId: 'conv-1', roomId: 'room-1' });
    sendMessageToRoomMock.mockResolvedValue({});

    const { result } = renderHook(() => useSendMessageToUserHandler({ recipientUserId: 'user-2' }));
    await result.current.onSendMessage('hello there');

    expect(startDirectChatMock).toHaveBeenCalledWith('user-2');
    expect(sendMessageToRoomMock).toHaveBeenCalledWith({
      variables: { messageData: { roomID: 'room-1', message: 'hello there' } },
    });
  });

  test('reuses an existing conversation (dedup) — sends into the returned room without a second create', async () => {
    // startDirectChat dedups server-side; the handler always routes through it
    // and sends into whatever room it returns (existing or new).
    startDirectChatMock.mockResolvedValue({ conversationId: 'existing-conv', roomId: 'existing-room' });
    sendMessageToRoomMock.mockResolvedValue({});

    const { result } = renderHook(() => useSendMessageToUserHandler({ recipientUserId: 'user-2' }));
    await result.current.onSendMessage('hi again');

    expect(startDirectChatMock).toHaveBeenCalledTimes(1);
    expect(sendMessageToRoomMock).toHaveBeenCalledWith({
      variables: { messageData: { roomID: 'existing-room', message: 'hi again' } },
    });
  });

  test('throws when no recipient is loaded', async () => {
    const { result } = renderHook(() => useSendMessageToUserHandler({ recipientUserId: undefined }));
    await expect(result.current.onSendMessage('hello')).rejects.toThrow('Recipient user not loaded.');
    expect(startDirectChatMock).not.toHaveBeenCalled();
  });
});
