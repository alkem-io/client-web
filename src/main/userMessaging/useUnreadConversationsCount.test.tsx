import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  unread: {} as Record<string, number>,
  selectedRoomId: undefined as string | undefined,
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUserConversationsUnreadCountQuery: () => ({
    data: {
      me: {
        conversations: {
          conversations: ['a', 'b', 'c'].map(id => ({ id, room: { id } })),
        },
      },
    },
  }),
}));
vi.mock('./UserMessagingContext', () => ({
  useUserMessagingContext: () => ({ isEnabled: true, isOpen: true, selectedRoomId: harness.selectedRoomId }),
}));
vi.mock('./matrix/conversationSummaryStore', () => ({
  useConversationSummaries: () => null,
  displayedUnreadCount: (_summaries: unknown, roomId: string, selectedRoomId?: string) =>
    roomId === selectedRoomId ? 0 : (harness.unread[roomId] ?? 0),
}));

import { setIncomingCallRooms } from './calls/incomingCallStore';
import { useUnreadConversationsCount } from './useUnreadConversationsCount';

describe('useUnreadConversationsCount', () => {
  afterEach(() => {
    act(() => setIncomingCallRooms(new Set()));
    harness.unread = {};
    harness.selectedRoomId = undefined;
  });

  it('counts a conversation with a call the user is not in, once even when it also has unread messages', () => {
    harness.unread = { a: 2 };
    const { result } = renderHook(() => useUnreadConversationsCount());
    expect(result.current).toBe(1);

    act(() => setIncomingCallRooms(new Set(['a', 'b'])));
    expect(result.current).toBe(2);
  });

  it('does not count the call in the conversation being viewed', () => {
    harness.selectedRoomId = 'b';
    act(() => setIncomingCallRooms(new Set(['b'])));
    const { result } = renderHook(() => useUnreadConversationsCount());
    expect(result.current).toBe(0);
  });
});
