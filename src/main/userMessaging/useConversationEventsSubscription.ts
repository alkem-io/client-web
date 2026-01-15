import { useApolloClient } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  useConversationEventsSubscription as useSubscription,
  UserConversationsDocument,
  ConversationMessagesDocument,
} from '@/core/apollo/generated/apollo-hooks';
import {
  ConversationEventsSubscription,
  ConversationEventType,
  UserConversationsQuery,
  ConversationMessagesQuery,
} from '@/core/apollo/generated/graphql-schema';
import { useUserMessagingContext } from './UserMessagingContext';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useCallback } from 'react';
import { evictFromCache } from '@/core/apollo/utils/removeFromCache';

type ConversationCreatedEvent = NonNullable<
  NonNullable<ConversationEventsSubscription['conversationEvents']>['conversationCreated']
>;
type MessageReceivedEvent = NonNullable<
  NonNullable<ConversationEventsSubscription['conversationEvents']>['messageReceived']
>;
type MessageRemovedEvent = NonNullable<
  NonNullable<ConversationEventsSubscription['conversationEvents']>['messageRemoved']
>;
type ReadReceiptUpdatedEvent = NonNullable<
  NonNullable<ConversationEventsSubscription['conversationEvents']>['readReceiptUpdated']
>;

// Fragment for reading lastMessage from cache
const RoomLastMessageFragment = gql`
  fragment RoomLastMessage on Room {
    lastMessage {
      id
    }
  }
`;

// Fragment for reading messages from cache
const RoomMessagesFragment = gql`
  fragment RoomMessages on Room {
    messages {
      id
    }
  }
`;

// Shared fragment for writing messages to cache
const MessageCacheFragment = gql`
  fragment MessageCache on Message {
    id
    message
    timestamp
    reactions {
      id
    }
    threadID
    sender {
      ... on User {
        id
        __typename
        profile {
          id
          displayName
          avatar: visual(type: AVATAR) {
            id
            uri
          }
        }
      }
    }
  }
`;

export const useConversationEventsSubscription = (selectedRoomId: string | null) => {
  const { isEnabled } = useUserMessagingContext();
  const { isAuthenticated, userModel } = useCurrentUserContext();
  const client = useApolloClient();
  const currentUserId = userModel?.id;

  const handleConversationCreated = useCallback(
    (event: ConversationCreatedEvent) => {
      client.cache.updateQuery<UserConversationsQuery>({ query: UserConversationsDocument }, existing => {
        if (!existing?.me?.conversations?.users) return existing;

        const conversation = event.conversation;
        const room = conversation.room;
        const user = conversation.user;

        if (!room || !user) {
          return existing;
        }

        // Check if already exists (idempotency)
        if (existing.me.conversations.users.some(c => c.id === conversation.id)) {
          return existing;
        }

        // Use conversation data directly from event
        const newConversation = {
          __typename: 'Conversation' as const,
          id: conversation.id,
          room: {
            __typename: 'Room' as const,
            id: room.id,
            unreadCount: room.unreadCount,
            messagesCount: room.messagesCount,
            lastMessage: room.lastMessage,
          },
          user: {
            __typename: 'User' as const,
            id: user.id,
            profile: user.profile,
          },
        };

        return {
          ...existing,
          me: {
            ...existing.me,
            conversations: {
              ...existing.me.conversations,
              users: [newConversation, ...existing.me.conversations.users],
            },
          },
        };
      });
    },
    [client]
  );

  const handleMessageReceived = useCallback(
    (event: MessageReceivedEvent) => {
      const roomCacheId = client.cache.identify({
        __typename: 'Room',
        id: event.roomId,
      });

      if (!roomCacheId) return;

      // Check if currently viewing this conversation
      const isViewing = event.roomId === selectedRoomId;

      // Check if message is from current user (don't increment unread for own messages)
      const sender = event.message.sender;
      const isOwnMessage = sender && 'id' in sender && sender.id === currentUserId;

      // Write lastMessage to cache first to get a proper reference
      const lastMessageRef = client.cache.writeFragment({
        data: {
          __typename: 'Message',
          id: event.message.id,
          message: event.message.message,
          timestamp: event.message.timestamp,
          sender: event.message.sender,
          reactions: [],
          threadID: null,
        },
        fragment: MessageCacheFragment,
      });

      client.cache.modify({
        id: roomCacheId,
        fields: {
          // Update lastMessage with proper cache reference
          lastMessage: () => lastMessageRef,
          // Increment messagesCount
          messagesCount: (existing: number = 0) => existing + 1,
          // Increment unreadCount ONLY if NOT viewing and NOT own message
          unreadCount: (existing: number = 0) => (isViewing || isOwnMessage ? existing : existing + 1),
          // Append to messages array (if loaded in cache)
          messages: (existingMessages, { readField }) => {
            // Handle case where messages might not be an array
            if (!existingMessages || !Array.isArray(existingMessages)) {
              return existingMessages;
            }

            // Check if message already exists
            const messageId = event.message.id;
            const exists = existingMessages.some(ref => readField('id', ref) === messageId);
            if (exists) return existingMessages;

            // Reuse lastMessageRef (already written to cache above)
            return lastMessageRef ? [...existingMessages, lastMessageRef] : existingMessages;
          },
        },
      });

      // Also update the ConversationMessages query cache if it exists
      const conversationsData = client.cache.readQuery<UserConversationsQuery>({
        query: UserConversationsDocument,
      });
      const conversation = conversationsData?.me?.conversations?.users?.find(c => c.room?.id === event.roomId);

      if (conversation) {
        client.cache.updateQuery<ConversationMessagesQuery>(
          {
            query: ConversationMessagesDocument,
            variables: { conversationId: conversation.id },
          },
          existing => {
            if (!existing?.lookup?.conversation?.room?.messages) return existing;

            // Check if message already exists
            if (existing.lookup.conversation.room.messages.some(m => m.id === event.message.id)) {
              return existing;
            }

            const newMessage = {
              __typename: 'Message' as const,
              id: event.message.id,
              message: event.message.message,
              timestamp: event.message.timestamp,
              sender: event.message.sender,
            };

            return {
              ...existing,
              lookup: {
                ...existing.lookup,
                conversation: {
                  ...existing.lookup.conversation,
                  room: {
                    ...existing.lookup.conversation.room,
                    messages: [...existing.lookup.conversation.room.messages, newMessage],
                  },
                },
              },
            };
          }
        );
      }
    },
    [client, selectedRoomId, currentUserId]
  );

  const handleMessageRemoved = useCallback(
    (event: MessageRemovedEvent) => {
      const roomCacheId = client.cache.identify({
        __typename: 'Room',
        id: event.roomId,
      });

      if (!roomCacheId) return;

      // Remove message from room's messages array
      client.cache.modify({
        id: roomCacheId,
        fields: {
          messagesCount: (existing: number = 0) => Math.max(0, existing - 1),
          messages: (existingMessages, { readField }) => {
            if (!existingMessages || !Array.isArray(existingMessages)) {
              return existingMessages;
            }
            return existingMessages.filter(ref => readField('id', ref) !== event.messageId);
          },
        },
      });

      // Also update the ConversationMessages query cache if it exists
      const conversationsData = client.cache.readQuery<UserConversationsQuery>({
        query: UserConversationsDocument,
      });
      const conversation = conversationsData?.me?.conversations?.users?.find(c => c.room?.id === event.roomId);

      if (conversation) {
        client.cache.updateQuery<ConversationMessagesQuery>(
          {
            query: ConversationMessagesDocument,
            variables: { conversationId: conversation.id },
          },
          existing => {
            if (!existing?.lookup?.conversation?.room?.messages) return existing;

            return {
              ...existing,
              lookup: {
                ...existing.lookup,
                conversation: {
                  ...existing.lookup.conversation,
                  room: {
                    ...existing.lookup.conversation.room,
                    messages: existing.lookup.conversation.room.messages.filter(m => m.id !== event.messageId),
                  },
                },
              },
            };
          }
        );
      }

      // Evict the message from cache entirely
      evictFromCache(client.cache, event.messageId, 'Message');
    },
    [client]
  );

  const handleReadReceiptUpdated = useCallback(
    (event: ReadReceiptUpdatedEvent) => {
      const roomCacheId = client.cache.identify({
        __typename: 'Room',
        id: event.roomId,
      });

      if (!roomCacheId) return;

      // Read current room data to check lastMessage
      const roomData = client.cache.readFragment<{
        lastMessage?: { id: string } | null;
      }>({
        id: roomCacheId,
        fragment: RoomLastMessageFragment,
      });

      const lastMessageId = roomData?.lastMessage?.id;

      if (event.lastReadEventId === lastMessageId) {
        // User read ALL messages -> unreadCount = 0
        client.cache.modify({
          id: roomCacheId,
          fields: {
            unreadCount: () => 0,
          },
        });
      } else {
        // Partial read - try to calculate from cached messages
        const fullRoomData = client.cache.readFragment<{
          messages?: { id: string }[];
        }>({
          id: roomCacheId,
          fragment: RoomMessagesFragment,
        });

        if (fullRoomData?.messages) {
          const readIndex = fullRoomData.messages.findIndex(m => m.id === event.lastReadEventId);
          if (readIndex !== -1) {
            const unreadCount = fullRoomData.messages.length - readIndex - 1;
            client.cache.modify({
              id: roomCacheId,
              fields: {
                unreadCount: () => unreadCount,
              },
            });
          }
        }
        // If messages not in cache, count will sync on next query
      }
    },
    [client]
  );

  useSubscription({
    skip: !isEnabled || !isAuthenticated,
    onData: ({ data }) => {
      const event = data.data?.conversationEvents;
      if (!event) return;

      switch (event.eventType) {
        case ConversationEventType.ConversationCreated:
          if (event.conversationCreated) {
            handleConversationCreated(event.conversationCreated);
          }
          break;
        case ConversationEventType.MessageReceived:
          if (event.messageReceived) {
            handleMessageReceived(event.messageReceived);
          }
          break;
        case ConversationEventType.MessageRemoved:
          if (event.messageRemoved) {
            handleMessageRemoved(event.messageRemoved);
          }
          break;
        case ConversationEventType.ReadReceiptUpdated:
          if (event.readReceiptUpdated) {
            handleReadReceiptUpdated(event.readReceiptUpdated);
          }
          break;
      }
    },
  });
};
