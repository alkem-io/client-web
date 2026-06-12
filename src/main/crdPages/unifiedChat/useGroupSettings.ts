import { debounce } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import {
  UserConversationsDocument,
  useAssignConversationMemberMutation,
  useRemoveConversationMemberMutation,
  useUpdateConversationMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { ActorType, type UserConversationsQuery, type UserFilterInput } from '@/core/apollo/generated/graphql-schema';
import type { ShareUser } from '@/crd/forms/UserSelector';
import { useContributors } from '@/domain/community/inviteContributors/components/FormikContributorsSelectorField/useContributors';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import type { ConversationMember } from '@/main/userMessaging/useUserConversations';

/**
 * Drives the group-settings flow: contributor search, add/remove members
 * (immediate), and rename (on save). Mirrors the legacy GroupChatManagementDialog
 * wiring. Avatar upload is intentionally not wired yet (needs a CRD image cropper).
 */
export const useGroupSettings = (conversationId: string | undefined, members: ConversationMember[]) => {
  const { userModel: currentUser } = useCurrentUserContext();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<UserFilterInput>();
  const [saving, setSaving] = useState(false);

  const [assignMember] = useAssignConversationMemberMutation();
  const [removeConversationMember] = useRemoveConversationMemberMutation();
  const [updateConversation] = useUpdateConversationMutation();
  const { data: contributors = [], loading } = useContributors({ filter, onlyUsersInRole: false, pageSize: 20 });

  const memberIds = new Set(members.map(member => member.id));
  const searchResults: ShareUser[] = contributors
    .filter(user => user.id !== currentUser?.id && !memberIds.has(user.id))
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

  const onSearchChange = (query: string) => {
    setSearchQuery(query);
    debouncedSetFilter(query);
  };

  const onAddMember = async (userId: string) => {
    if (!conversationId) {
      return;
    }
    const contributor = contributors.find(item => item.id === userId);
    await assignMember({
      variables: { memberData: { conversationID: conversationId, memberID: userId } },
      update: cache =>
        cache.updateQuery<UserConversationsQuery>({ query: UserConversationsDocument }, existing => {
          if (!existing?.me?.conversations?.conversations) return existing;
          return {
            ...existing,
            me: {
              ...existing.me,
              conversations: {
                ...existing.me.conversations,
                conversations: existing.me.conversations.conversations.map(c => {
                  if (c.id !== conversationId) return c;
                  if (c.members.some(m => m.id === userId)) return c;
                  return {
                    ...c,
                    members: [
                      ...c.members,
                      {
                        __typename: 'Actor' as const,
                        id: userId,
                        type: ActorType.User,
                        profile: {
                          __typename: 'Profile' as const,
                          id: `temp-profile-${userId}`,
                          displayName: contributor?.profile?.displayName ?? '',
                          url: '',
                          avatar: contributor?.profile?.visual
                            ? {
                                __typename: 'Visual' as const,
                                id: `temp-visual-${userId}`,
                                uri: contributor.profile.visual.uri,
                              }
                            : undefined,
                        },
                      },
                    ],
                  };
                }),
              },
            },
          };
        }),
    });
    setSearchQuery('');
    setFilter(undefined);
  };

  const onRemoveMember = async (userId: string) => {
    if (!conversationId) {
      return;
    }
    await removeConversationMember({
      variables: { memberData: { conversationID: conversationId, memberID: userId } },
      update: cache =>
        cache.updateQuery<UserConversationsQuery>({ query: UserConversationsDocument }, existing => {
          if (!existing?.me?.conversations?.conversations) return existing;
          return {
            ...existing,
            me: {
              ...existing.me,
              conversations: {
                ...existing.me.conversations,
                conversations: existing.me.conversations.conversations.map(c =>
                  c.id === conversationId ? { ...c, members: c.members.filter(m => m.id !== userId) } : c
                ),
              },
            },
          };
        }),
    });
  };

  const onSave = async (displayName: string) => {
    if (!conversationId) {
      return;
    }
    setSaving(true);
    try {
      await updateConversation({
        variables: { updateData: { conversationID: conversationId, displayName: displayName.trim() } },
      });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const openDialog = () => {
    setSearchQuery('');
    setFilter(undefined);
    setOpen(true);
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSearchQuery('');
      setFilter(undefined);
    }
  };

  return {
    open,
    openDialog,
    onOpenChange,
    searchQuery,
    onSearchChange,
    searchResults,
    loading,
    onAddMember,
    onRemoveMember,
    onSave,
    saving,
  };
};
