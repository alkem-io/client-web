import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const mockCreateConversation = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCreateConversationMutation: () => [mockCreateConversation],
}));

const mockSetIsOpen = vi.fn();
const mockSetSelectedConversationId = vi.fn();
const mockSetSelectedRoomId = vi.fn();
const mockSetNewlyCreatedConversationId = vi.fn();
vi.mock('@/main/userMessaging/UserMessagingContext', () => ({
  useUserMessagingContext: () => ({
    setIsOpen: mockSetIsOpen,
    setSelectedConversationId: mockSetSelectedConversationId,
    setSelectedRoomId: mockSetSelectedRoomId,
    setNewlyCreatedConversationId: mockSetNewlyCreatedConversationId,
  }),
}));

import { useStartDirectChat } from './useStartDirectChat';

function mockMutationResult(conversationId: string, roomId: string) {
  return {
    data: {
      createConversation: {
        id: conversationId,
        room: {
          id: roomId,
          type: 'DIRECT',
          displayName: undefined,
          avatarUrl: undefined,
          createdDate: new Date().toISOString(),
          unreadCount: 0,
          messagesCount: 0,
          lastMessage: undefined,
        },
      },
    },
  };
}

describe('useStartDirectChat — click-time recipient', () => {
  beforeEach(() => {
    mockCreateConversation.mockReset();
    mockSetIsOpen.mockReset();
    mockSetSelectedConversationId.mockReset();
    mockSetSelectedRoomId.mockReset();
    mockSetNewlyCreatedConversationId.mockReset();
  });

  test('hook called with undefined: startDirectChat("u-2") creates the conversation for u-2 and opens the panel on it', async () => {
    mockCreateConversation.mockResolvedValue(mockMutationResult('conv-2', 'room-2'));
    const { result } = renderHook(() => useStartDirectChat(undefined));

    const outcome = await result.current.startDirectChat('u-2');

    expect(mockCreateConversation).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { conversationData: { memberIDs: ['u-2'], type: 'DIRECT' } },
        // The global error-handler link must not also toast a raw server error —
        // callers (e.g. ContributorCollectionConnector) map a rejection to their
        // own friendly message.
        context: { skipGlobalErrorHandler: true },
      })
    );
    expect(outcome).toEqual({ conversationId: 'conv-2', roomId: 'room-2' });
    expect(mockSetSelectedConversationId).toHaveBeenCalledWith('conv-2');
    expect(mockSetSelectedRoomId).toHaveBeenCalledWith('room-2');
    expect(mockSetIsOpen).toHaveBeenCalledWith(true);
  });

  test('hook called with u-1 and no argument still targets u-1 (backward compatible)', async () => {
    mockCreateConversation.mockResolvedValue(mockMutationResult('conv-1', 'room-1'));
    const { result } = renderHook(() => useStartDirectChat('u-1'));

    await result.current.startDirectChat();

    expect(mockCreateConversation).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { conversationData: { memberIDs: ['u-1'], type: 'DIRECT' } },
      })
    );
  });

  test('both undefined ⇒ rejects and never calls the mutation', async () => {
    const { result } = renderHook(() => useStartDirectChat(undefined));

    await expect(result.current.startDirectChat()).rejects.toThrow('Recipient user not loaded.');
    expect(mockCreateConversation).not.toHaveBeenCalled();
  });
});
