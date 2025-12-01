import { useUserConversationsQuery } from '@/core/apollo/generated/apollo-hooks';
import { useUserMessagingContext } from './UserMessagingContext';
import { useMemo } from 'react';

export interface UserConversationMessage {
  id: string;
  message: string;
  timestamp: number;
  sender?: {
    id: string;
    displayName: string;
    avatarUri?: string;
  };
}

export interface UserConversation {
  id: string;
  roomId: string;
  messagesCount: number;
  messages: UserConversationMessage[];
  user: {
    id: string;
    displayName: string;
    avatarUri?: string;
    url?: string;
  };
  lastMessage?: UserConversationMessage;
}

export const useUserConversations = () => {
  const { isEnabled, isOpen } = useUserMessagingContext();

  const { data, loading, error, refetch } = useUserConversationsQuery({
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
          const messages: UserConversationMessage[] = (conv.room?.messages ?? []).map(msg => ({
            id: msg.id,
            message: msg.message,
            timestamp: msg.timestamp,
            sender:
              msg.sender?.__typename === 'User'
                ? {
                    id: msg.sender.id,
                    displayName: msg.sender.profile?.displayName ?? '',
                    avatarUri: msg.sender.profile?.avatar?.uri,
                  }
                : undefined,
          }));

          // Sort messages by timestamp
          messages.sort((a, b) => a.timestamp - b.timestamp);

          return {
            id: conv.id,
            roomId: conv.room?.id ?? '',
            messagesCount: conv.room?.messagesCount ?? 0,
            messages,
            user: {
              id: conv.user!.id,
              displayName: conv.user!.profile?.displayName ?? '',
              avatarUri: conv.user!.profile?.avatar?.uri,
              url: conv.user!.profile?.url,
            },
            lastMessage: messages.length > 0 ? messages[messages.length - 1] : undefined,
          };
        })
        // Sort conversations: no messages first (newest chats), then by last message timestamp (most recent first)
        .sort((a, b) => {
          // Conversations without messages go to the top
          if (!a.lastMessage && !b.lastMessage) return 0;
          if (!a.lastMessage) return -1;
          if (!b.lastMessage) return 1;
          // Both have messages - sort by most recent first
          return b.lastMessage.timestamp - a.lastMessage.timestamp;
        })
    );
  }, [data?.me?.conversations?.users]);

  return {
    conversations,
    isLoading: loading,
    error,
    refetch,
  };
};
