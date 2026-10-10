import { useApolloClient } from '@apollo/client';
import { useEffect, useRef } from 'react';
import {
  ConversationDetailsDocument,
  UserConversationsDocument,
  UserConversationsUnreadCountDocument,
  useConversationEventsSubscription as useSubscription,
} from '@/core/apollo/generated/apollo-hooks';
import {
  type ConversationDetailsQuery,
  type ConversationEventsSubscription,
  ConversationEventType,
  type UserConversationsQuery,
  type UserConversationsUnreadCountQuery,
} from '@/core/apollo/generated/graphql-schema';
import { evictFromCache } from '@/core/apollo/utils/evictFromCache';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useUserMessagingContext } from './UserMessagingContext';

type SelectionClearer = (conversationId: string) => void;

type ConversationCreatedEvent = NonNullable<
  NonNullable<ConversationEventsSubscription['conversationEvents']>['conversationCreated']
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

export const useConversationEventsSubscription = () => {
  const { isEnabled, selectedConversationId, setSelectedConversationId, setSelectedRoomId } = useUserMessagingContext();
  const { isAuthenticated, userModel } = useCurrentUserContext();
  const client = useApolloClient();
  const currentUserId = userModel?.id;

  // Use a ref for the selection read inside the onData callback to avoid stale
  // closures when the React Compiler memoizes the subscription options.
  //
  // The ref is synced in a useEffect rather than during render (React 19
  // concurrency hygiene). onData fires post-commit, so it always reads the
  // latest committed value.
  const selectedConversationIdRef = useRef(selectedConversationId);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const clearSelectionIfActive: SelectionClearer = (conversationId: string) => {
    if (selectedConversationIdRef.current === conversationId) {
      setSelectedConversationId(null);
      setSelectedRoomId(null);
    }
  };

  const handleConversationCreated = (event: ConversationCreatedEvent) => {
    const conversation = event.conversation;
    const room = conversation.room;

    if (!room) {
      return;
    }

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
                  room: { __typename: 'Room' as const, id: room.id },
                },
                ...existing.me.conversations.conversations,
              ],
            },
          },
        };
      }
    );
  };

  const handleConversationUpdated = (event: ConversationUpdatedEvent) => {
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
  };

  const handleConversationDeleted = (event: ConversationDeletedEvent) => {
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
  };

  const handleMemberAdded = async (event: MemberAddedEvent) => {
    // Self-detection: current user was added to a group
    if (event.addedMember.id === currentUserId) {
      try {
        const { data } = await client.query<ConversationDetailsQuery>({
          query: ConversationDetailsDocument,
          variables: { conversationId: event.conversation.id },
          fetchPolicy: 'network-only',
        });

        const conversation = data?.lookup?.conversation;
        const room = conversation?.room;

        if (!conversation || !room) {
          return;
        }

        // Write to full conversations cache
        client.cache.updateQuery<UserConversationsQuery>({ query: UserConversationsDocument }, existing => {
          if (!existing?.me?.conversations?.conversations) return existing;

          // Idempotency + race condition guard: skip if already present
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
                    room: {
                      __typename: 'Room' as const,
                      id: room.id,
                      type: room.type,
                      displayName: room.displayName,
                      avatarUrl: room.avatarUrl,
                      createdDate: room.createdDate,
                    },
                    members: conversation.members,
                  },
                  ...existing.me.conversations.conversations,
                ],
              },
            },
          };
        });

        // Write to lightweight unread count cache
        client.cache.updateQuery<UserConversationsUnreadCountQuery>(
          { query: UserConversationsUnreadCountDocument },
          existing => {
            if (!existing?.me?.conversations?.conversations) return existing;

            // Idempotency + race condition guard
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
                      room: { __typename: 'Room' as const, id: room.id },
                    },
                    ...existing.me.conversations.conversations,
                  ],
                },
              },
            };
          }
        );
      } catch {
        // Silently fail — the conversation will appear on next full refetch
      }
      return;
    }

    // Non-self: another member was added to a group we're in — update member list
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
  };

  const handleMemberRemoved = (event: MemberRemovedEvent) => {
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
  };

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
      }
    },
  });
};
