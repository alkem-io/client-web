import { UserConversationsDocument, useCreateConversationMutation } from '@/core/apollo/generated/apollo-hooks';
import { ConversationCreationType, type UserConversationsQuery } from '@/core/apollo/generated/graphql-schema';
import { useUserMessagingContext } from '@/main/userMessaging/UserMessagingContext';

export type StartDirectChatResult = {
  conversationId: string;
  roomId: string;
};

/**
 * Opens (or creates) the persistent 1:1 chat with a single user and reveals it
 * in the chat panel. Extracted from `useNewChat` so the profile "Message" flow
 * and the US2/US3 "open chat" confirmation action share one seam.
 *
 * `createConversation(type: DIRECT)` is dedup-or-create server-side: calling it
 * for a user the requester already has a 1:1 chat with returns the existing
 * conversation, so no duplicate is created (FR-002).
 */
export const useStartDirectChat = (userId: string | undefined) => {
  const [createConversation] = useCreateConversationMutation();
  const { setIsOpen, setSelectedConversationId, setSelectedRoomId, setNewlyCreatedConversationId } =
    useUserMessagingContext();

  const startDirectChat = async (): Promise<StartDirectChatResult> => {
    if (!userId) {
      throw new Error('Recipient user not loaded.');
    }

    const result = await createConversation({
      variables: {
        conversationData: {
          memberIDs: [userId],
          type: ConversationCreationType.Direct,
        },
      },
      update: (cache, { data }) => {
        const conversation = data?.createConversation;
        const room = conversation?.room;
        if (!conversation || !room) {
          return;
        }
        cache.updateQuery<UserConversationsQuery>({ query: UserConversationsDocument }, existing => {
          if (!existing?.me?.conversations?.conversations) return existing;
          if (existing.me.conversations.conversations.some(c => c.id === conversation.id)) return existing;
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
                    room: {
                      __typename: 'Room' as const,
                      id: room.id,
                      type: room.type,
                      displayName: room.displayName,
                      avatarUrl: room.avatarUrl,
                      createdDate: room.createdDate,
                      // Write the real values through from the createConversation
                      // result (its `room` selection matches UserConversations).
                      // Previously these were hard-coded 0/0 and `lastMessage:
                      // undefined`, which left `lastMessage` missing from the cache
                      // and risked incomplete-cache reads.
                      unreadCount: room.unreadCount,
                      messagesCount: room.messagesCount,
                      lastMessage: room.lastMessage,
                    },
                    members: conversation.members,
                  },
                  ...existing.me.conversations.conversations,
                ],
              },
            },
          };
        });
      },
    });

    const conversationId = result.data?.createConversation.id;
    const roomId = result.data?.createConversation.room?.id;
    if (!conversationId || !roomId) {
      throw new Error('Conversation could not be opened.');
    }

    setNewlyCreatedConversationId(conversationId);
    setSelectedConversationId(conversationId);
    setSelectedRoomId(roomId);
    setIsOpen(true);

    return { conversationId, roomId };
  };

  return { startDirectChat };
};
