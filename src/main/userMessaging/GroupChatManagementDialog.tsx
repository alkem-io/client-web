import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Typography,
  Skeleton,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CloseIcon from '@mui/icons-material/Close';
import { debounce } from 'lodash-es';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import { ProfileChipView } from '@/domain/community/contributor/ProfileChip/ProfileChipView';
import {
  useCreateConversationMutation,
  useAssignConversationMemberMutation,
  useRemoveConversationMemberMutation,
  useUpdateConversationMutation,
  useUploadFileMutation,
  useDefaultVisualTypeConstraintsQuery,
  UserConversationsDocument,
} from '@/core/apollo/generated/apollo-hooks';
import {
  ActorType,
  ConversationCreationType,
  UserConversationsQuery,
  UserFilterInput,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import {
  ContributorItem,
  useContributors,
} from '@/domain/community/inviteContributors/components/FormikContributorsSelectorField/useContributors';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import Avatar from '@/core/ui/avatar/Avatar';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { ConversationMember } from './useUserConversations';
import FileUploadWrapper from '@/core/ui/upload/FileUploadWrapper';
import { CropDialog } from '@/core/ui/upload/VisualUpload/CropDialog';
import useStorageConfig from '@/domain/storage/StorageBucket/useStorageConfig';
import { useNotification } from '@/core/ui/notifications/useNotification';

interface GroupChatCreateProps {
  open: boolean;
  onClose: () => void;
  mode: 'create';
  onGroupCreated: (conversationId: string, roomId: string) => void;
}

interface GroupChatManageProps {
  open: boolean;
  onClose: () => void;
  mode: 'manage';
  conversationId: string;
  currentMembers: ConversationMember[];
  displayName?: string;
  avatarUrl?: string;
}

type GroupChatManagementDialogProps = GroupChatCreateProps | GroupChatManageProps;

export const GroupChatManagementDialog = (props: GroupChatManagementDialogProps) => {
  const { open, onClose, mode } = props;
  const { t } = useTranslation();
  const { userModel: currentUser } = useCurrentUserContext();
  const notify = useNotification();
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<UserFilterInput>();

  // Create mode state
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<ConversationMember[]>([]);

  const [createConversation] = useCreateConversationMutation();
  const [addMember] = useAssignConversationMemberMutation();
  const [removeMember] = useRemoveConversationMemberMutation();
  const [updateConversation] = useUpdateConversationMutation();

  // Manage mode: editable group name
  const [editedDisplayName, setEditedDisplayName] = useState(mode === 'manage' ? (props.displayName ?? '') : '');

  // Avatar upload state
  const [avatarUrl, setAvatarUrl] = useState(mode === 'manage' ? (props.avatarUrl ?? '') : '');
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();

  // SSOT: fetch constraints from platform configuration
  const { data: constraintsData } = useDefaultVisualTypeConstraintsQuery({
    variables: { visualType: VisualType.Avatar },
    skip: !open,
  });
  const visualConstraints = constraintsData?.platform.configuration.defaultVisualTypeConstraints;

  const { storageConfig } = useStorageConfig({ locationType: 'platform', skip: !open });

  const [uploadFile, { loading: isUploading }] = useUploadFileMutation({
    onCompleted: data => {
      const url = data.uploadFileOnStorageBucket.url;
      setAvatarUrl(url);
      if (mode === 'manage') {
        updateConversation({
          variables: {
            updateData: {
              conversationID: props.conversationId,
              avatarUrl: url,
            },
          },
        });
      }
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

  const handleSaveDisplayName = async () => {
    if (mode !== 'manage' || editedDisplayName.trim() === (props.displayName ?? '')) return;
    await updateConversation({
      variables: {
        updateData: {
          conversationID: props.conversationId,
          displayName: editedDisplayName.trim(),
        },
      },
    });
  };

  const { data: contributors = [], loading: loadingContributors } = useContributors({
    filter,
    onlyUsersInRole: false,
    pageSize: 20,
  });

  // Get the effective member list (for manage mode use props, for create use local state)
  const effectiveMembers = mode === 'manage' ? props.currentMembers : selectedMembers;

  // Filter out current user and already-present members
  const filteredContributors = useMemo(() => {
    const memberIds = new Set(effectiveMembers.map(m => m.id));
    return contributors.filter(user => user.id !== currentUser?.id && !memberIds.has(user.id));
  }, [contributors, currentUser?.id, effectiveMembers]);

  const debouncedSetFilter = useMemo(
    () =>
      debounce((val: string) => {
        setFilter(val ? { email: val, displayName: val } : undefined);
      }, 300),
    []
  );

  const handleInputChange = (_event: React.SyntheticEvent, value: string) => {
    setInputValue(value);
    debouncedSetFilter(value);
  };

  const handleMemberSelect = async (_event: React.SyntheticEvent, value: ContributorItem | null) => {
    if (!value) return;

    if (mode === 'manage') {
      await addMember({
        variables: {
          memberData: {
            conversationID: props.conversationId,
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
                    if (c.id !== props.conversationId) return c;
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
                            id: '',
                            displayName: value.profile?.displayName ?? '',
                            url: '',
                            avatar: value.profile?.visual
                              ? {
                                  __typename: 'Visual' as const,
                                  id: '',
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
    } else {
      setSelectedMembers(prev => [
        ...prev,
        {
          id: value.id,
          type: ActorType.User,
          displayName: value.profile?.displayName ?? '',
          avatarUri: value.profile?.visual?.uri,
        },
      ]);
    }
    setInputValue('');
    setFilter(undefined);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (mode === 'manage') {
      await removeMember({
        variables: {
          memberData: {
            conversationID: props.conversationId,
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
                    if (c.id !== props.conversationId) return c;
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
    } else {
      setSelectedMembers(prev => prev.filter(m => m.id !== memberId));
    }
  };

  const isValid = mode === 'create' ? selectedMembers.length > 0 && groupName.trim().length > 0 : true;

  const [handleCreateGroup, isCreating] = useLoadingState(async () => {
    if (mode !== 'create' || !isValid) return;

    const result = await createConversation({
      variables: {
        conversationData: {
          memberIDs: selectedMembers.map(m => m.id),
          type: ConversationCreationType.Group,
          displayName: groupName.trim(),
          avatarUrl: avatarUrl || undefined,
        },
      },
    });

    const conversationId = result.data?.createConversation.id;
    const roomId = result.data?.createConversation.room?.id;

    if (conversationId && roomId) {
      props.onGroupCreated(conversationId, roomId);
    }
    handleClose();
  });

  const handleClose = () => {
    setGroupName('');
    setSelectedMembers([]);
    setInputValue('');
    setFilter(undefined);
    setAvatarUrl(mode === 'manage' ? (props.avatarUrl ?? '') : '');
    onClose();
  };

  const title =
    mode === 'create'
      ? t('components.userMessaging.startGroupChat' as TranslationKey)
      : t('components.userMessaging.manageGroup' as TranslationKey);

  return (
    <DialogWithGrid open={open} columns={8} onClose={handleClose} aria-labelledby="group-chat-dialog">
      <DialogHeader id="group-chat-dialog" title={title} onClose={handleClose} />
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={gutters()}>
          {/* Avatar upload */}
          <Box display="flex" flexDirection="column" alignItems="center" gap={gutters(0.5)}>
            <FileUploadWrapper
              onFileSelected={handleAvatarFileSelected}
              allowedTypes={visualConstraints?.allowedTypes ?? []}
            >
              {isUploading ? (
                <Skeleton variant="circular" width={80} height={80} />
              ) : (
                <Avatar
                  src={avatarUrl || undefined}
                  alt={mode === 'create' ? groupName : editedDisplayName}
                  size="large"
                  sx={{ cursor: 'pointer', boxShadow: '0 0 4px rgba(0, 0, 0, 0.2)' }}
                />
              )}
            </FileUploadWrapper>
            <Caption color="neutral.light">
              {t('components.userMessaging.editProfilePicture' as TranslationKey)}
            </Caption>
          </Box>

          {cropDialogOpen && visualConstraints && (
            <CropDialog
              open={cropDialogOpen}
              file={selectedFile}
              onClose={() => setCropDialogOpen(false)}
              onSave={handleAvatarCropSave}
              config={visualConstraints}
              hideAltText
            />
          )}

          {/* Group name */}
          <Box>
            <Caption marginBottom={gutters(0.5)}>
              {t('components.userMessaging.groupChatName' as TranslationKey)}
            </Caption>
            <TextField
              value={mode === 'create' ? groupName : editedDisplayName}
              onChange={e => (mode === 'create' ? setGroupName(e.target.value) : setEditedDisplayName(e.target.value))}
              onBlur={mode === 'manage' ? handleSaveDisplayName : undefined}
              placeholder={t('components.userMessaging.groupChatName' as TranslationKey)}
              variant="outlined"
              size="small"
              fullWidth
              required={mode === 'create'}
              error={mode === 'create' && groupName.length === 0 && selectedMembers.length > 0}
              helperText={
                mode === 'create' && groupName.length === 0 && selectedMembers.length > 0
                  ? t('components.userMessaging.groupChatNameRequired' as TranslationKey)
                  : undefined
              }
            />
          </Box>

          {/* Member search */}
          <Box>
            <Caption marginBottom={gutters(0.5)}>{t('components.userMessaging.addMembers' as TranslationKey)}</Caption>
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
          </Box>

          {/* Members list */}
          {effectiveMembers.length > 0 && (
            <Box>
              <Caption marginBottom={gutters(0.25)}>
                {t('components.userMessaging.groupMembers' as TranslationKey)} ({effectiveMembers.length})
              </Caption>
              <List dense disablePadding>
                {effectiveMembers.map(member => (
                  <ListItem
                    key={member.id}
                    secondaryAction={
                      member.id !== currentUser?.id ? (
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleRemoveMember(member.id)}
                          aria-label={t('components.userMessaging.remove' as TranslationKey)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      ) : undefined
                    }
                    sx={{ paddingX: 0 }}
                  >
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar src={member.avatarUri} alt={member.displayName} size="small" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" noWrap>
                          {member.displayName}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Validation hint (create mode only) */}
          {mode === 'create' && selectedMembers.length === 0 && (
            <Caption color="neutral.light" fontStyle="italic">
              {t('components.userMessaging.noMembersSelected' as TranslationKey)}
            </Caption>
          )}
        </Box>
      </DialogContent>
      {mode === 'create' && (
        <DialogActions>
          <Button variant="contained" onClick={handleCreateGroup} disabled={!isValid || isCreating}>
            {t('components.userMessaging.createGroupChat' as TranslationKey)}
          </Button>
        </DialogActions>
      )}
    </DialogWithGrid>
  );
};
