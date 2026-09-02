import { debounce } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import { UserConversationsDocument, useCreateConversationMutation } from '@/core/apollo/generated/apollo-hooks';
import {
  ConversationCreationType,
  type UserConversationsQuery,
  type UserFilterInput,
} from '@/core/apollo/generated/graphql-schema';
import type { ShareUser } from '@/crd/forms/UserSelector';
import { useContributors } from '@/domain/community/inviteContributors/components/FormikContributorsSelectorField/useContributors';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useLoadingState from '@/domain/shared/utils/useLoadingState';

/**
 * Drives the "new message" flow: contributor search + create a direct (1 person)
 * or group (2+) conversation. Mirrors the legacy NewMessageDialog wiring.
 */
export const useNewChat = (onCreated: (conversationId: string, roomId: string) => void) => {
  const { userModel: currentUser } = useCurrentUserContext();
  const [open, setOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<ShareUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<UserFilterInput>();

  const [createConversation] = useCreateConversationMutation();
  const { data: contributors = [], loading } = useContributors({ filter, onlyUsersInRole: false, pageSize: 20 });

  const selectedIds = new Set(selectedUsers.map(user => user.id));
  const searchResults: ShareUser[] = contributors
    .filter(user => user.id !== currentUser?.id && !selectedIds.has(user.id))
    .map(user => ({
      id: user.id,
      displayName: user.profile?.displayName ?? '',
      avatarUrl: user.profile?.visual?.uri,
      city: user.profile?.location?.city,
      country: user.profile?.location?.country,
    }));

  const debouncedSetFilter = useRef(
    debounce((value: string) => {
      setFilter(value ? { email: value, displayName: value } : undefined);
    }, 300)
  ).current;
  useEffect(() => () => debouncedSetFilter.cancel(), [debouncedSetFilter]);

  const reset = () => {
    setSelectedUsers([]);
    setSearchQuery('');
    setFilter(undefined);
  };

  const onSearchChange = (query: string) => {
    setSearchQuery(query);
    debouncedSetFilter(query);
  };

  const onSelect = (user: ShareUser) => {
    setSelectedUsers(previous => [...previous, user]);
    setSearchQuery('');
    setFilter(undefined);
  };

  const onRemove = (userId: string) => setSelectedUsers(previous => previous.filter(user => user.id !== userId));

  const [create, creating] = useLoadingState(async () => {
    if (selectedUsers.length === 0) {
      return;
    }
    const isGroup = selectedUsers.length > 1;
    const displayName = isGroup ? selectedUsers.map(user => user.displayName).join(', ') : undefined;

    const result = await createConversation({
      variables: {
        conversationData: {
          memberIDs: selectedUsers.map(user => user.id),
          type: isGroup ? ConversationCreationType.Group : ConversationCreationType.Direct,
          displayName,
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
                      unreadCount: 0,
                      messagesCount: 0,
                      lastMessage: undefined,
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
    if (conversationId && roomId) {
      onCreated(conversationId, roomId);
    }
    setOpen(false);
    reset();
  });

  const openDialog = () => {
    reset();
    setOpen(true);
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      reset();
    }
  };

  return {
    open,
    openDialog,
    onOpenChange,
    searchQuery,
    onSearchChange,
    searchResults,
    selectedUsers,
    onSelect,
    onRemove,
    loading,
    creating,
    create,
  };
};
