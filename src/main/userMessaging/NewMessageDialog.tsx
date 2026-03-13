import CancelIcon from '@mui/icons-material/Cancel';
import { Box, Button, CircularProgress, DialogActions, DialogContent, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { debounce } from 'lodash-es';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserConversationsDocument, useCreateConversationMutation } from '@/core/apollo/generated/apollo-hooks';
import {
  ConversationCreationType,
  type UserConversationsQuery,
  type UserFilterInput,
} from '@/core/apollo/generated/graphql-schema';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import Avatar from '@/core/ui/avatar/Avatar';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { ProfileChipView } from '@/domain/community/contributor/ProfileChip/ProfileChipView';
import {
  type ContributorItem,
  useContributors,
} from '@/domain/community/inviteContributors/components/FormikContributorsSelectorField/useContributors';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useLoadingState from '@/domain/shared/utils/useLoadingState';

interface NewMessageDialogProps {
  open: boolean;
  onClose: () => void;
  onConversationCreated: (conversationId: string, roomId: string) => void;
}

interface SelectedUser {
  id: string;
  displayName: string;
  avatarUri?: string;
}

export const NewMessageDialog = ({ open, onClose, onConversationCreated }: NewMessageDialogProps) => {
  const { t } = useTranslation();
  const { userModel: currentUser } = useCurrentUserContext();
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<UserFilterInput>();

  const [createConversation] = useCreateConversationMutation();

  const { data: contributors = [], loading: loadingContributors } = useContributors({
    filter,
    onlyUsersInRole: false,
    pageSize: 20,
  });

  const selectedIds = useMemo(() => new Set(selectedUsers.map(u => u.id)), [selectedUsers]);

  const filteredContributors = useMemo(() => {
    return contributors.filter(user => user.id !== currentUser?.id && !selectedIds.has(user.id));
  }, [contributors, currentUser?.id, selectedIds]);

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

  const handleUserSelect = (_event: React.SyntheticEvent, value: ContributorItem | null) => {
    if (!value) return;
    setSelectedUsers(prev => [
      ...prev,
      {
        id: value.id,
        displayName: value.profile?.displayName ?? '',
        avatarUri: value.profile?.visual?.uri,
      },
    ]);
    setInputValue('');
    setFilter(undefined);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const [handleCreateChat, isCreating] = useLoadingState(async () => {
    if (selectedUsers.length === 0) return;

    const isGroup = selectedUsers.length > 1;
    const displayName = isGroup ? selectedUsers.map(u => u.displayName).join(', ') : undefined;

    const result = await createConversation({
      variables: {
        conversationData: {
          memberIDs: selectedUsers.map(u => u.id),
          type: isGroup ? ConversationCreationType.Group : ConversationCreationType.Direct,
          displayName,
        },
      },
      update: (cache, { data }) => {
        const conversation = data?.createConversation;
        const room = conversation?.room;
        if (!conversation || !room) return;

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
                      createdDate: new Date(),
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
      onConversationCreated(conversationId, roomId);
    }
    handleClose();
  });

  const handleClose = () => {
    setSelectedUsers([]);
    setInputValue('');
    setFilter(undefined);
    onClose();
  };

  return (
    <DialogWithGrid
      open={open}
      columns={8}
      onClose={handleClose}
      aria-labelledby="new-message-dialog"
      sx={{
        '.MuiDialog-paper': {
          maxWidth: 530,
        },
      }}
    >
      <DialogHeader
        id="new-message-dialog"
        title={t('components.userMessaging.newMessage' as TranslationKey)}
        onClose={handleClose}
      />
      <DialogContent>
        <Box display="flex" flexDirection="column">
          {/* User search */}
          <Autocomplete
            options={filteredContributors}
            getOptionLabel={option => option.profile?.displayName ?? ''}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onChange={handleUserSelect}
            value={null}
            loading={loadingContributors}
            noOptionsText={
              inputValue
                ? t('components.userMessaging.noUsersFound' as TranslationKey)
                : t('components.userMessaging.startTyping' as TranslationKey)
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

          {/* Selected members as chips */}
          {selectedUsers.length > 0 && (
            <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1} paddingTop={2.5}>
              {selectedUsers.map(user => (
                <Box
                  key={user.id}
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  gap={1.25}
                  sx={{
                    background: '#D3D3D3',
                    borderRadius: '12px',
                    padding: '0 5px',
                    minWidth: 64,
                    height: 30,
                  }}
                >
                  <Avatar
                    src={user.avatarUri}
                    alt={user.displayName}
                    sx={{
                      width: 24,
                      height: 24,
                      filter: 'drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.15))',
                      borderRadius: '6px',
                    }}
                  />
                  <Box
                    component="span"
                    sx={{
                      fontFamily: '"Source Sans Pro", sans-serif',
                      fontWeight: 400,
                      fontSize: 12,
                      lineHeight: '20px',
                      color: '#1D384A',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 80,
                    }}
                  >
                    {user.displayName}
                  </Box>
                  <CancelIcon
                    onClick={() => handleRemoveUser(user.id)}
                    sx={{
                      width: 16.8,
                      height: 16.8,
                      color: '#A8A8A8',
                      cursor: 'pointer',
                      '&:hover': { color: '#1D384A' },
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'flex-end', padding: '20px', gap: 1.25 }}>
        <Button
          variant="text"
          onClick={handleClose}
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
          onClick={handleCreateChat}
          disabled={selectedUsers.length === 0 || isCreating}
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
          {t('components.userMessaging.createChat' as TranslationKey)}
        </Button>
      </DialogActions>
    </DialogWithGrid>
  );
};
