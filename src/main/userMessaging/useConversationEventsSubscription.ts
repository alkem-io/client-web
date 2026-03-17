import { gql, useApolloClient } from '@apollo/client';
import { useCallback } from 'react';
import {
  ConversationMessagesDocument,
  UserConversationsDocument,
  UserConversationsUnreadCountDocument,
  useConversationEventsSubscription as useSubscription,
} from '@/core/apollo/generated/apollo-hooks';
import {
  type ConversationEventsSubscription,
  ConversationEventType,
  type ConversationMessagesQuery,
  RoomType,
  type UserConversationsQuery,
  type UserConversationsUnreadCountQuery,
} from '@/core/apollo/generated/graphql-schema';
import { evictFromCache } from '@/core/apollo/utils/removeFromCache';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useUserMessagingContext } from './UserMessagingContext';

type SelectionClearer = (conversationId: string) => void;

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
type ConversationUpdatedEvent = NonNullable<
  NonNullable<ConversationEventsSubscription['conversationEvents']>['conversationUpdated']
>;
type ConversationDeletedEvent = NonNullable<
  NonNullable<ConversationEventsSubscription['conversationEvents']>['conversationDeleted']
>;
type MemberAddedEvent = NonNullable<NonNullable<ConversationEventsSubscription['conversationEvents']>['memberAdded']>;
type MemberRemovedEvent = NonNullable<
  NonNullable<ConversationEventsSubscription['conversationEvents']>['memberRemoved']
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
      id
      type
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
`;

export const useConversationEventsSubscription = (selectedRoomId: string | null) => {
  const {
    isEnabled,
    selectedConversationId,
    setSelectedConversationId,
    setSelectedRoomId,
    newlyCreatedConversationId,
  } = useUserMessagingContext();
  const { isAuthenticated, userModel } = useCurrentUserContext();
  const client = useApolloClient();
  const currentUserId = userModel?.id;

  const clearSelectionIfActive: SelectionClearer = useCallback(
    (conversationId: string) => {
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
        setSelectedRoomId(null);
      }
    },
    [selectedConversationId, setSelectedConversationId, setSelectedRoomId]
  );

  const handleConversationCreated = useCallback(
    (event: ConversationCreatedEvent) => {
      const conversation = event.conversation;
      const room = conversation.room;

      if (!room) {
        return;
      }

      // Group conversations with 0 messages should still show a badge so the
      // user knows they were added. The server returns unreadCount=0 (correct
      // for Matrix), so we override it client-side only for conversations
      // arriving via the subscription (new ones), not old ones loaded by query.
      // Skip the override for the creator's own conversation (they already know about it).
      const isOwnCreation = conversation.id === newlyCreatedConversationId;
      const effectiveUnreadCount =
        room.type === RoomType.ConversationGroup && !isOwnCreation ? Math.max(room.unreadCount, 1) : room.unreadCount;

      client.cache.updateQuery<UserConversationsQuery>({ query: UserConversationsDocument }, existing => {
        if (!existing?.me?.conversations?.conversations) return existing;

        // Check if already exists (idempotency)
        if (existing.me.conversations.conversations.some(c => c.id === conversation.id)) {
          return existing;
        }

        // Use conversation data directly from event
        const newConversation = {
          __typename: 'Conversation' as const,
          id: conversation.id,
          room: {
            __typename: 'Room' as const,
            id: room.id,
            type: room.type,
            displayName: room.displayName,
            avatarUrl: room.avatarUrl,
            createdDate: room.createdDate,
            unreadCount: effectiveUnreadCount,
            messagesCount: room.messagesCount,
            lastMessage: room.lastMessage,
          },
          members: conversation.members,
        };

        return {
          ...existing,
          me: {
            ...existing.me,
            conversations: {
              ...existing.me.conversations,
              conversations: [newConversation, ...existing.me.conversations.conversations],
            },
          },
        };
      });

      // Also update the lightweight unread count query so the nav bar badge works
      client.cache.updateQuery<UserConversationsUnreadCountQuery>(
        { query: UserConversationsUnreadCountDocument },
        existing => {
          if (!existing?.me?.conversations?.conversations) return existing;

          if (existing.me.conversations.conversations.some(c => c.id === conversation.id)) {
            return existing;
          }

          return {
            ...existing,
            me: {
              ...existing.me,
              conversations: {
                ...existing.me.conversations,
                conversations: [
                  {
                    __typename: 'Conversation' as const,
                    id: conversation.id,
                    room: { __typename: 'Room' as const, id: room.id, unreadCount: effectiveUnreadCount },
                  },
                  ...existing.me.conversations.conversations,
                ],
              },
            },
          };
        }
      );
    },
    [client, newlyCreatedConversationId]
  );

  const handleConversationUpdated = useCallback(
    (event: ConversationUpdatedEvent) => {
      client.cache.updateQuery<UserConversationsQuery>({ query: UserConversationsDocument }, existing => {
        if (!existing?.me?.conversations?.conversations) return existing;

        return {
          ...existing,
          me: {
            ...existing.me,
            conversations: {
              ...existing.me.conversations,
              conversations: existing.me.conversations.conversations.map(c => {
                if (c.id !== event.conversation.id) return c;
                return {
                  ...c,
                  room: c.room
                    ? {
                        ...c.room,
                        displayName: event.conversation.room?.displayName ?? c.room.displayName,
                        avatarUrl: event.conversation.room?.avatarUrl ?? c.room.avatarUrl,
                      }
                    : c.room,
                };
              }),
            },
          },
        };
      });
    },
    [client]
  );

  const handleConversationDeleted = useCallback(
    (event: ConversationDeletedEvent) => {
      clearSelectionIfActive(event.conversationID);

      // Read room ID before removing from list so we can evict it
      const existing = client.cache.readQuery<UserConversationsQuery>({ query: UserConversationsDocument });
      const deletedConv = existing?.me?.conversations?.conversations?.find(c => c.id === event.conversationID);
      const deletedRoomId = deletedConv?.room?.id;

      client.cache.updateQuery<UserConversationsQuery>({ query: UserConversationsDocument }, data => {
        if (!data?.me?.conversations?.conversations) return data;

        return {
          ...data,
          me: {
            ...data.me,
            conversations: {
              ...data.me.conversations,
              conversations: data.me.conversations.conversations.filter(c => c.id !== event.conversationID),
            },
          },
        };
      });

      client.cache.updateQuery<UserConversationsUnreadCountQuery>(
        { query: UserConversationsUnreadCountDocument },
        data => {
          if (!data?.me?.conversations?.conversations) return data;

          return {
            ...data,
            me: {
              ...data.me,
              conversations: {
                ...data.me.conversations,
                conversations: data.me.conversations.conversations.filter(c => c.id !== event.conversationID),
              },
            },
          };
        }
      );

      // Evict normalized entities to free memory and prevent stale references
      evictFromCache(client.cache, event.conversationID, 'Conversation');
      if (deletedRoomId) {
        evictFromCache(client.cache, deletedRoomId, 'Room');
      }
    },
    [client, clearSelectionIfActive]
  );

  const handleMemberAdded = useCallback(
    (event: MemberAddedEvent) => {
      client.cache.updateQuery<UserConversationsQuery>({ query: UserConversationsDocument }, existing => {
        if (!existing?.me?.conversations?.conversations) return existing;
        return {
          ...existing,
          me: {
            ...existing.me,
            conversations: {
              ...existing.me.conversations,
              conversations: existing.me.conversations.conversations.map(c => {
                if (c.id !== event.conversation.id) return c;
                // Idempotent: only add if not already present
                if (c.members.some(m => m.id === event.addedMember.id)) return c;
                return {
                  ...c,
                  members: [...c.members, event.addedMember],
                };
              }),
            },
          },
        };
      });
    },
    [client]
  );

  const handleMemberRemoved = useCallback(
    (event: MemberRemovedEvent) => {
      if (event.removedMemberID === currentUserId) {
        clearSelectionIfActive(event.conversation.id);

        client.cache.updateQuery<UserConversationsQuery>({ query: UserConversationsDocument }, existing => {
          if (!existing?.me?.conversations?.conversations) return existing;
          return {
            ...existing,
            me: {
              ...existing.me,
              conversations: {
                ...existing.me.conversations,
                conversations: existing.me.conversations.conversations.filter(c => c.id !== event.conversation.id),
              },
            },
          };
        });

        client.cache.updateQuery<UserConversationsUnreadCountQuery>(
          { query: UserConversationsUnreadCountDocument },
          existing => {
            if (!existing?.me?.conversations?.conversations) return existing;
            return {
              ...existing,
              me: {
                ...existing.me,
                conversations: {
                  ...existing.me.conversations,
                  conversations: existing.me.conversations.conversations.filter(c => c.id !== event.conversation.id),
                },
              },
            };
          }
        );
        return;
      }
      // Idempotent: only remove if still present
      client.cache.updateQuery<UserConversationsQuery>({ query: UserConversationsDocument }, existing => {
        if (!existing?.me?.conversations?.conversations) return existing;
        return {
          ...existing,
          me: {
            ...existing.me,
            conversations: {
              ...existing.me.conversations,
              conversations: existing.me.conversations.conversations.map(c => {
                if (c.id !== event.conversation.id) return c;
                return {
                  ...c,
                  members: c.members.filter(m => m.id !== event.removedMemberID),
                };
              }),
            },
          },
        };
      });
    },
    [client, currentUserId, clearSelectionIfActive]
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
      const conversation = conversationsData?.me?.conversations?.conversations?.find(c => c.room?.id === event.roomId);

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
              reactions: [],
              threadID: null,
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
      const conversation = conversationsData?.me?.conversations?.conversations?.find(c => c.room?.id === event.roomId);

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
        case ConversationEventType.ConversationUpdated:
          if (event.conversationUpdated) {
            handleConversationUpdated(event.conversationUpdated);
          }
          break;
        case ConversationEventType.ConversationDeleted:
          if (event.conversationDeleted) {
            handleConversationDeleted(event.conversationDeleted);
          }
          break;
        case ConversationEventType.MemberAdded:
          if (event.memberAdded) {
            handleMemberAdded(event.memberAdded);
          }
          break;
        case ConversationEventType.MemberRemoved:
          if (event.memberRemoved) {
            handleMemberRemoved(event.memberRemoved);
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
