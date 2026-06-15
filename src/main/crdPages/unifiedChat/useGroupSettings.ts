import { debounce } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';
import {
  UserConversationsDocument,
  useAssignConversationMemberMutation,
  useDefaultVisualTypeConstraintsQuery,
  useRemoveConversationMemberMutation,
  useUpdateConversationMutation,
  useUploadFileMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  ActorType,
  type UserConversationsQuery,
  type UserFilterInput,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import type { ShareUser } from '@/crd/forms/UserSelector';
import { useContributors } from '@/domain/community/inviteContributors/components/FormikContributorsSelectorField/useContributors';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useStorageConfig from '@/domain/storage/StorageBucket/useStorageConfig';
import type { ConversationMember } from '@/main/userMessaging/useUserConversations';

type GroupInitialValues = {
  displayName: string;
  avatarUrl: string;
};

/**
 * Drives the group-settings flow: contributor search, add/remove members
 * (immediate), rename + avatar (on save). The avatar is cropped via the CRD
 * `ImageCropDialog`, uploaded eagerly to platform storage, and persisted to the
 * conversation only on Save. Mirrors the legacy GroupChatManagementDialog wiring.
 */
export const useGroupSettings = (
  conversationId: string | undefined,
  members: ConversationMember[],
  initial: GroupInitialValues
) => {
  const { userModel: currentUser } = useCurrentUserContext();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<UserFilterInput>();
  const [saving, setSaving] = useState(false);

  // Avatar (pending until Save)
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [cropFile, setCropFile] = useState<File>();
  const [cropOpen, setCropOpen] = useState(false);

  const [assignMember] = useAssignConversationMemberMutation();
  const [removeConversationMember] = useRemoveConversationMemberMutation();
  const [updateConversation] = useUpdateConversationMutation();
  const { data: contributors = [], loading } = useContributors({ filter, onlyUsersInRole: false, pageSize: 20 });

  const { data: constraintsData } = useDefaultVisualTypeConstraintsQuery({
    variables: { visualType: VisualType.Avatar },
    skip: !open,
  });
  const visualConstraints = constraintsData?.platform.configuration.defaultVisualTypeConstraints;

  const { storageConfig } = useStorageConfig({ locationType: 'platform', skip: !open });

  const [uploadFile, { loading: isUploadingAvatar }] = useUploadFileMutation({
    onCompleted: data => {
      setAvatarUrl(data.uploadFileOnStorageBucket.url);
      setCropOpen(false);
      setCropFile(undefined);
    },
  });

  // Re-seed the pending avatar whenever the dialog (re)opens for a conversation.
  useEffect(() => {
    if (open) {
      setAvatarUrl(initial.avatarUrl);
    }
  }, [open, initial.avatarUrl]);

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

  const onAvatarFileSelected = (file: File) => {
    setCropFile(file);
    setCropOpen(true);
  };

  const onCropSave = async (file: File) => {
    if (!storageConfig) {
      return;
    }
    await uploadFile({ variables: { file, uploadData: { storageBucketId: storageConfig.storageBucketId } } });
  };

  const onCropCancel = () => {
    setCropOpen(false);
    setCropFile(undefined);
  };

  const avatarDirty = avatarUrl !== initial.avatarUrl;

  const onSave = async (displayName: string) => {
    if (!conversationId) {
      return;
    }
    setSaving(true);
    try {
      if (displayName.trim() !== initial.displayName) {
        await updateConversation({
          variables: { updateData: { conversationID: conversationId, displayName: displayName.trim() } },
        });
      }
      if (avatarDirty) {
        await updateConversation({ variables: { updateData: { conversationID: conversationId, avatarUrl } } });
      }
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
      setCropOpen(false);
      setCropFile(undefined);
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
    // avatar
    avatarUrl,
    avatarDirty,
    isUploadingAvatar,
    onAvatarFileSelected,
    cropFile,
    cropOpen,
    onCropSave,
    onCropCancel,
    visualConstraints,
  };
};
