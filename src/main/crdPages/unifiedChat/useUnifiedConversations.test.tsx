import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ActorType } from '@/core/apollo/generated/graphql-schema';

const member = (id: string, displayName: string) => ({
  id,
  type: 'USER',
  profile: { displayName, url: `/u/${id}`, avatar: { uri: `${id}.png` } },
});

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUserConversationsQuery: () => ({
    loading: false,
    error: undefined,
    data: {
      me: {
        conversations: {
          conversations: [
            {
              id: 'conv-1',
              room: {
                id: 'room-1',
                type: 'CONVERSATION_DIRECT',
                displayName: 'conversation-1',
                createdDate: '2026-01-01',
              },
              members: [member('me', 'Me'), member('other', 'Other')],
            },
          ],
        },
      },
    },
  }),
}));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({ userModel: { id: 'me' } }),
}));
vi.mock('@/main/userMessaging/UserMessagingContext', () => ({
  useUserMessagingContext: () => ({
    isEnabled: true,
    isOpen: true,
    newlyCreatedConversationId: null,
    selectedRoomId: null,
  }),
}));
vi.mock('./UnifiedChatProvider', () => ({ useUnifiedChatContext: () => ({ guidanceVcId: undefined }) }));
// No Matrix client: the summaries are undefined.
vi.mock('@/main/userMessaging/matrix/conversationSummaryStore', () => ({
  useConversationSummaries: () => undefined,
  displayedUnreadCount: () => 0,
}));

import { useUnifiedConversations } from './useUnifiedConversations';

describe('useUnifiedConversations without a Matrix session', () => {
  it('still lists the conversations from GraphQL, with no preview and no unread count', () => {
    const { result } = renderHook(() => useUnifiedConversations());

    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.conversations[0]).toEqual(
      expect.objectContaining({
        id: 'conv-1',
        roomId: 'room-1',
        isGroup: false,
        displayName: 'Other',
        unreadCount: 0,
        lastMessage: undefined,
      })
    );
    expect(result.current.conversations[0].members.map(m => m.type)).toEqual([ActorType.User, ActorType.User]);
    expect(result.current.totalUnreadCount).toBe(0);
  });
});
