import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { debounce } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import Avatar from '@/core/ui/avatar/Avatar';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { gutters } from '@/core/ui/grid/utils';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { Caption } from '@/core/ui/typography';
import FileUploadWrapper from '@/core/ui/upload/FileUploadWrapper';
import { CropDialog } from '@/core/ui/upload/VisualUpload/CropDialog';
import { ProfileChipView } from '@/domain/community/contributor/ProfileChip/ProfileChipView';
import {
  type ContributorItem,
  useContributors,
} from '@/domain/community/inviteContributors/components/FormikContributorsSelectorField/useContributors';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useStorageConfig from '@/domain/storage/StorageBucket/useStorageConfig';
import type { ConversationMember } from './useUserConversations';

interface GroupChatManagementDialogProps {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  currentMembers: ConversationMember[];
  displayName?: string;
  avatarUrl?: string;
  onLeaveGroup?: () => void;
}

export const GroupChatManagementDialog = (props: GroupChatManagementDialogProps) => {
  const { open, onClose, conversationId, currentMembers } = props;
  const { t } = useTranslation();
  const { userModel: currentUser } = useCurrentUserContext();
  const notify = useNotification();
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<UserFilterInput>();
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);

  // Member mutations fire immediately — subscription refetch keeps the list in sync
  const [addMember] = useAssignConversationMemberMutation();
  const [removeMember] = useRemoveConversationMemberMutation();
  const [updateConversation] = useUpdateConversationMutation();

  // Display name and avatar are pending until Save
  const [editedDisplayName, setEditedDisplayName] = useState(props.displayName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(props.avatarUrl ?? '');
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();

  const { data: constraintsData } = useDefaultVisualTypeConstraintsQuery({
    variables: { visualType: VisualType.Avatar },
    skip: !open,
  });
  const visualConstraints = constraintsData?.platform.configuration.defaultVisualTypeConstraints;

  const { storageConfig } = useStorageConfig({ locationType: 'platform', skip: !open });

  // Upload file eagerly to get URL, persist to conversation only on Save
  const [uploadFile, { loading: isUploading }] = useUploadFileMutation({
    onCompleted: data => {
      setAvatarUrl(data.uploadFileOnStorageBucket.url);
    },
    onError: () => {
      notify(t('components.file-upload.file-upload-error' as TranslationKey), 'error');
    },
  });

  const handleAvatarFileSelected = (file: File) => {
    setSelectedFile(file);
    setCropDialogOpen(true);
  };

  const handleAvatarCropSave = async (data: { file: File; altText: string }) => {
    if (!storageConfig) return;
    await uploadFile({
      variables: {
        file: data.file,
        uploadData: {
          storageBucketId: storageConfig.storageBucketId,
        },
      },
    });
  };

  // Only display name and avatar are considered "unsaved"
  const hasUnsavedChanges = useMemo(() => {
    return editedDisplayName.trim() !== (props.displayName ?? '') || avatarUrl !== (props.avatarUrl ?? '');
  }, [editedDisplayName, props.displayName, avatarUrl, props.avatarUrl]);

  const { data: contributors = [], loading: loadingContributors } = useContributors({
    filter,
    onlyUsersInRole: false,
    pageSize: 20,
  });

  const filteredContributors = useMemo(() => {
    const memberIds = new Set(currentMembers.map(m => m.id));
    return contributors.filter(user => user.id !== currentUser?.id && !memberIds.has(user.id));
  }, [contributors, currentUser?.id, currentMembers]);

  const debouncedSetFilter = useMemo(
    () =>
      debounce((val: string) => {
        setFilter(val ? { email: val, displayName: val } : undefined);
      }, 300),
    []
  );

  useEffect(() => {
    return () => debouncedSetFilter.cancel();
  }, [debouncedSetFilter]);

  const handleInputChange = (_event: React.SyntheticEvent, value: string) => {
    setInputValue(value);
    debouncedSetFilter(value);
  };

  // Add member immediately — subscription refetch updates the list
  const handleMemberSelect = async (_event: React.SyntheticEvent, value: ContributorItem | null) => {
    if (!value) return;

    await addMember({
      variables: {
        memberData: {
          conversationID: conversationId,
          memberID: value.id,
        },
      },
      update: cache => {
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
                  if (c.members.some(m => m.id === value.id)) return c;
                  return {
                    ...c,
                    members: [
                      ...c.members,
                      {
                        __typename: 'Actor' as const,
                        id: value.id,
                        type: ActorType.User,
                        profile: {
                          __typename: 'Profile' as const,
                          id: `temp-profile-${value.id}`,
                          displayName: value.profile?.displayName ?? '',
                          url: '',
                          avatar: value.profile?.visual
                            ? {
                                __typename: 'Visual' as const,
                                id: `temp-visual-${value.id}`,
                                uri: value.profile.visual.uri,
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
        });
      },
    });
    setInputValue('');
    setFilter(undefined);
  };

  // Remove member immediately — subscription refetch updates the list
  const handleRemoveMember = async (memberId: string) => {
    await removeMember({
      variables: {
        memberData: {
          conversationID: conversationId,
          memberID: memberId,
        },
      },
      update: cache => {
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
                  return {
                    ...c,
                    members: c.members.filter(m => m.id !== memberId),
                  };
                }),
              },
            },
          };
        });
      },
    });
  };

  const resetLocalState = useCallback(() => {
    setEditedDisplayName(props.displayName ?? '');
    setAvatarUrl(props.avatarUrl ?? '');
    setInputValue('');
    setFilter(undefined);
    setIsAddMembersOpen(false);
  }, [props.displayName, props.avatarUrl]);

  const handleRequestClose = () => {
    if (hasUnsavedChanges) {
      setIsDiscardConfirmOpen(true);
    } else {
      resetLocalState();
      onClose();
    }
  };

  const handleDiscardAndClose = () => {
    setIsDiscardConfirmOpen(false);
    resetLocalState();
    onClose();
  };

  const handleSave = async () => {
    if (editedDisplayName.trim() !== (props.displayName ?? '')) {
      await updateConversation({
        variables: {
          updateData: {
            conversationID: conversationId,
            displayName: editedDisplayName.trim(),
          },
        },
      });
    }

    if (avatarUrl !== (props.avatarUrl ?? '')) {
      await updateConversation({
        variables: {
          updateData: {
            conversationID: conversationId,
            avatarUrl,
          },
        },
      });
    }

    setInputValue('');
    setFilter(undefined);
    setIsAddMembersOpen(false);
    onClose();
  };

  return (
    <DialogWithGrid
      open={open}
      columns={8}
      onClose={handleRequestClose}
      aria-labelledby="group-chat-dialog"
      sx={{
        '.MuiDialog-paper': {
          maxWidth: 706,
        },
      }}
    >
      <DialogHeader
        id="group-chat-dialog"
        title={props.displayName ?? t('components.userMessaging.manageGroup' as TranslationKey)}
        onClose={handleRequestClose}
      />
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={gutters()}>
          {/* Avatar upload */}
          <FileUploadWrapper
            onFileSelected={handleAvatarFileSelected}
            allowedTypes={visualConstraints?.allowedTypes ?? []}
          >
            <Box display="flex" flexDirection="row" alignItems="center" gap={gutters()} sx={{ cursor: 'pointer' }}>
              {isUploading ? (
                <Skeleton variant="circular" width={80} height={80} />
              ) : (
                <Avatar
                  src={avatarUrl || undefined}
                  alt={editedDisplayName}
                  size="large"
                  sx={{ boxShadow: '0 0 4px rgba(0, 0, 0, 0.2)' }}
                />
              )}
              <Caption
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 500,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  color: '#1D384A',
                }}
              >
                {t('components.userMessaging.editProfilePicture' as TranslationKey)}
              </Caption>
            </Box>
          </FileUploadWrapper>

          {cropDialogOpen && visualConstraints && (
            <CropDialog
              open={cropDialogOpen}
              file={selectedFile}
              onClose={() => setCropDialogOpen(false)}
              onSave={handleAvatarCropSave}
              config={visualConstraints}
              hideAltText={true}
            />
          )}

          {/* Group Chat Name */}
          <TextField
            value={editedDisplayName}
            onChange={e => setEditedDisplayName(e.target.value)}
            label={t('components.userMessaging.groupChatName' as TranslationKey)}
            variant="outlined"
            size="small"
            fullWidth={true}
          />

          {/* Add Members toggle */}
          {isAddMembersOpen ? (
            <Autocomplete
              options={filteredContributors}
              getOptionLabel={option => option.profile?.displayName ?? ''}
              inputValue={inputValue}
              onInputChange={handleInputChange}
              onChange={handleMemberSelect}
              value={null}
              loading={loadingContributors}
              noOptionsText={
                inputValue
                  ? t('components.userMessaging.noUsersFound' as TranslationKey)
                  : t('components.userMessaging.selectMembersHint' as TranslationKey)
              }
              renderInput={params => (
                <TextField
                  {...params}
                  placeholder={t('components.userMessaging.searchUsers' as TranslationKey)}
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingContributors && <CircularProgress size={20} />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <ProfileChipView
                    displayName={option.profile?.displayName ?? ''}
                    avatarUrl={option.profile?.visual?.uri}
                    city={option.profile?.location?.city}
                    country={option.profile?.location?.country}
                  />
                </li>
              )}
            />
          ) : (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setIsAddMembersOpen(true)}
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 500,
                fontSize: 12,
                textTransform: 'uppercase',
                color: '#1D384A',
                borderColor: '#1D384A',
                borderRadius: '12px',
                alignSelf: 'flex-start',
              }}
            >
              {t('components.userMessaging.addMembers' as TranslationKey)}
            </Button>
          )}

          {/* Group Members bordered section */}
          {currentMembers.length > 0 && (
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '12px',
                padding: gutters(),
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 400,
                  fontSize: 15,
                  lineHeight: '20px',
                  color: '#1D384A',
                  marginBottom: gutters(0.5),
                }}
              >
                {t('components.userMessaging.groupMembers' as TranslationKey)}
              </Typography>
              <Box display="flex" flexDirection="column" gap={1.5}>
                {currentMembers.map(member => (
                  <Box key={member.id} display="flex" flexDirection="row" alignItems="center" gap={2}>
                    <Avatar
                      src={member.avatarUri}
                      alt={member.displayName}
                      sx={{
                        width: 48,
                        height: 48,
                        boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.15)',
                        borderRadius: '12px',
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: '"Montserrat", sans-serif',
                        fontWeight: 400,
                        fontSize: 15,
                        lineHeight: '20px',
                        color: '#1D384A',
                        flexGrow: 1,
                      }}
                      noWrap={true}
                    >
                      {member.displayName}
                    </Typography>
                    {member.id !== currentUser?.id && (
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleRemoveMember(member.id)}
                        sx={{
                          fontFamily: '"Montserrat", sans-serif',
                          fontWeight: 500,
                          fontSize: 12,
                          lineHeight: '20px',
                          textTransform: 'uppercase',
                          color: '#646464',
                          minWidth: 'auto',
                          padding: 0,
                        }}
                      >
                        {t('components.userMessaging.remove' as TranslationKey)}
                      </Button>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', padding: '20px' }}>
        {props.onLeaveGroup ? (
          <Button
            variant="text"
            onClick={props.onLeaveGroup}
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 500,
              fontSize: 12,
              textTransform: 'uppercase',
              color: '#1D384A',
            }}
          >
            {t('components.userMessaging.leaveGroup' as TranslationKey)}
          </Button>
        ) : (
          <Box />
        )}
        <Box display="flex" gap={1.25}>
          <Button
            variant="text"
            onClick={handleRequestClose}
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 500,
              fontSize: 12,
              textTransform: 'uppercase',
              color: '#1D384A',
            }}
          >
            {t('buttons.back' as TranslationKey)}
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 500,
              fontSize: 12,
              textTransform: 'uppercase',
              background: '#1D384A',
              borderRadius: '12px',
              padding: '5px 15px',
              '&:hover': { background: '#15293A' },
            }}
          >
            {t('components.userMessaging.saveGroup' as TranslationKey)}
          </Button>
        </Box>
      </DialogActions>

      {/* Discard changes confirmation */}
      <Dialog
        open={isDiscardConfirmOpen}
        onClose={() => setIsDiscardConfirmOpen(false)}
        aria-labelledby="discard-confirm-title"
      >
        <DialogHeader
          id="discard-confirm-title"
          title={t('components.userMessaging.discardChangesTitle' as TranslationKey)}
          onClose={() => setIsDiscardConfirmOpen(false)}
        />
        <DialogContent>
          <Typography>{t('components.userMessaging.discardChangesMessage' as TranslationKey)}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDiscardConfirmOpen(false)}>{t('buttons.cancel' as TranslationKey)}</Button>
          <Button variant="contained" color="error" onClick={handleDiscardAndClose}>
            {t('components.userMessaging.discardChanges' as TranslationKey)}
          </Button>
        </DialogActions>
      </Dialog>
    </DialogWithGrid>
  );
};
