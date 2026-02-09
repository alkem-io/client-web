import { useUserConversationsQuery } from '@/core/apollo/generated/apollo-hooks';
import { useUserMessagingContext } from './UserMessagingContext';
import { useMemo } from 'react';
import { ConversationMessage, mapMessageReactions, mapMessageSender } from './models';

export interface UserConversation {
  id: string;
  roomId: string;
  unreadCount: number;
  messagesCount: number;
  lastMessage?: ConversationMessage;
  user: {
    id: string;
    displayName: string;
    avatarUri?: string;
    url?: string;
  };
}

export const useUserConversations = () => {
  const { isEnabled, isOpen, newlyCreatedConversationId } = useUserMessagingContext();

  const { data, loading, error } = useUserConversationsQuery({
    skip: !isEnabled || !isOpen,
    fetchPolicy: 'cache-and-network',
  });

  const conversations = useMemo<UserConversation[]>(() => {
    if (!data?.me?.conversations?.users) {
      return [];
    }

    return (
      data.me.conversations.users
        .filter(conv => conv.user && conv.room)
        .map(conv => {
          const room = conv.room!;
          const lastMessage = room.lastMessage;

          return {
            id: conv.id,
            roomId: room.id,
            unreadCount: room.unreadCount,
            messagesCount: room.messagesCount,
            lastMessage: lastMessage
              ? {
                  id: lastMessage.id,
                  message: lastMessage.message,
                  timestamp: lastMessage.timestamp,
                  sender: mapMessageSender(lastMessage.sender),
                  reactions: mapMessageReactions(lastMessage.reactions),
                }
              : undefined,
            user: {
              id: conv.user!.id,
              displayName: conv.user!.profile?.displayName ?? '',
              avatarUri: conv.user!.profile?.avatar?.uri,
              url: conv.user!.profile?.url,
            },
          };
        })
        // Sort conversations: newly created first, then unread, then by last message timestamp
        .sort((a, b) => {
          // Newly created conversation always at the top
          if (a.id === newlyCreatedConversationId) return -1;
          if (b.id === newlyCreatedConversationId) return 1;

          // Unread conversations first
          if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
          if (a.unreadCount === 0 && b.unreadCount > 0) return 1;

          // Conversations without messages go to the end
          if (!a.lastMessage && !b.lastMessage) return 0;
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          // Both have messages - sort by most recent first
          return b.lastMessage.timestamp - a.lastMessage.timestamp;
        })
    );
  }, [data?.me?.conversations?.users, newlyCreatedConversationId]);

  const totalUnreadCount = useMemo(() => {
    return conversations.filter(conv => conv.unreadCount > 0).length;
  }, [conversations]);

  return {
    conversations,
    totalUnreadCount,
    isLoading: loading,
    error,
  };
};
