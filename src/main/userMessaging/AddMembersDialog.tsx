import CancelIcon from '@mui/icons-material/Cancel';
import { Box, Button, CircularProgress, DialogActions, DialogContent, IconButton, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { debounce } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserConversationsDocument, useAssignConversationMemberMutation } from '@/core/apollo/generated/apollo-hooks';
import { ActorType, type UserConversationsQuery, type UserFilterInput } from '@/core/apollo/generated/graphql-schema';
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
import type { ConversationMember } from './useUserConversations';

interface AddMembersDialogProps {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  currentMembers: ConversationMember[];
}

interface SelectedUser {
  id: string;
  displayName: string;
  avatarUri?: string;
}

export const AddMembersDialog = ({ open, onClose, conversationId, currentMembers }: AddMembersDialogProps) => {
  const { t } = useTranslation();
  const { userModel: currentUser } = useCurrentUserContext();
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<UserFilterInput>();

  const [addMember] = useAssignConversationMemberMutation();

  const { data: contributors = [], loading: loadingContributors } = useContributors({
    filter,
    onlyUsersInRole: false,
    pageSize: 20,
  });

  const selectedIds = useMemo(() => new Set(selectedUsers.map(u => u.id)), [selectedUsers]);
  const memberIds = useMemo(() => new Set(currentMembers.map(m => m.id)), [currentMembers]);

  const filteredContributors = useMemo(() => {
    return contributors.filter(
      user => user.id !== currentUser?.id && !selectedIds.has(user.id) && !memberIds.has(user.id)
    );
  }, [contributors, currentUser?.id, selectedIds, memberIds]);

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

  const [handleAddMembers, isAdding] = useLoadingState(async () => {
    if (selectedUsers.length === 0) return;

    for (const user of selectedUsers) {
      await addMember({
        variables: {
          memberData: {
            conversationID: conversationId,
            memberID: user.id,
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
                    if (c.members.some(m => m.id === user.id)) return c;
                    return {
                      ...c,
                      members: [
                        ...c.members,
                        {
                          __typename: 'Actor' as const,
                          id: user.id,
                          type: ActorType.User,
                          profile: {
                            __typename: 'Profile' as const,
                            id: '',
                            displayName: user.displayName,
                            url: '',
                            avatar: user.avatarUri
                              ? {
                                  __typename: 'Visual' as const,
                                  id: '',
                                  uri: user.avatarUri,
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
      aria-labelledby="add-members-dialog"
      sx={{
        '.MuiDialog-paper': {
          maxWidth: 530,
        },
      }}
    >
      <DialogHeader
        id="add-members-dialog"
        title={t('components.userMessaging.addMembers' as TranslationKey)}
        onClose={handleClose}
      />
      <DialogContent>
        <Box display="flex" flexDirection="column">
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
                  <IconButton
                    onClick={() => handleRemoveUser(user.id)}
                    aria-label={`${t('buttons.remove')} ${user.displayName}`}
                    size="small"
                    sx={{ padding: 0 }}
                  >
                    <CancelIcon
                      sx={{
                        width: 16.8,
                        height: 16.8,
                        color: '#A8A8A8',
                        '&:hover': { color: '#1D384A' },
                      }}
                    />
                  </IconButton>
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
          onClick={handleAddMembers}
          disabled={selectedUsers.length === 0 || isAdding}
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
          {t('components.userMessaging.addMembers' as TranslationKey)}
        </Button>
      </DialogActions>
    </DialogWithGrid>
  );
};
