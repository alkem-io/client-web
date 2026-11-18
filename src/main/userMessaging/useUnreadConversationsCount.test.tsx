import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({
  unread: {} as Record<string, number>,
  selectedRoomId: undefined as string | undefined,
  isOpen: true,
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUserConversationsUnreadCountQuery: ({ skip }: { skip: boolean }) => ({
    data: skip
      ? undefined
      : {
          me: {
            conversations: {
              conversations: ['a', 'b', 'c'].map(id => ({ id, room: { id } })),
            },
          },
        },
  }),
}));
vi.mock('./UserMessagingContext', () => ({
  useUserMessagingContext: () => ({ isEnabled: true, isOpen: harness.isOpen, selectedRoomId: harness.selectedRoomId }),
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
    act(() => setIncomingCallRooms(new Map()));
    harness.unread = {};
    harness.selectedRoomId = undefined;
    harness.isOpen = true;
    vi.useRealTimers();
  });

  it('counts a conversation with a call the user is not in, once even when it also has unread messages', () => {
    harness.unread = { a: 2 };
    const { result } = renderHook(() => useUnreadConversationsCount());
    expect(result.current).toBe(1);

    act(() =>
      setIncomingCallRooms(
        new Map([
          ['a', null],
          ['b', null],
        ])
      )
    );
    expect(result.current).toBe(2);
  });

  it('waits out the startup delay once, then a later mount has the count on its first render', () => {
    vi.useFakeTimers();
    harness.isOpen = false;
    harness.unread = { a: 1, b: 3 };

    const first = renderHook(() => useUnreadConversationsCount());
    expect(first.result.current).toBe(0);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(first.result.current).toBe(2);
    first.unmount();

    const later = renderHook(() => useUnreadConversationsCount());
    expect(later.result.current).toBe(2);
  });
});
