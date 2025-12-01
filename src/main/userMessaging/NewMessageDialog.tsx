import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, DialogContent, DialogActions, TextField, Chip, CircularProgress, Button } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { debounce } from 'lodash';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import { ProfileChipView } from '@/domain/community/contributor/ProfileChip/ProfileChipView';
import { useCreateConversationMutation } from '@/core/apollo/generated/apollo-hooks';
import { CommunicationConversationType, UserFilterInput } from '@/core/apollo/generated/graphql-schema';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import {
  ContributorItem,
  useContributors,
} from '@/domain/community/inviteContributors/components/FormikContributorsSelectorField/useContributors';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import Avatar from '@/core/ui/avatar/Avatar';
import TranslationKey from '@/core/i18n/utils/TranslationKey';

interface NewMessageDialogProps {
  open: boolean;
  onClose: () => void;
  onConversationCreated: (userId: string) => void;
}

interface SelectedUser {
  id: string;
  displayName: string;
  avatarUri?: string;
  city?: string;
  country?: string;
}

export const NewMessageDialog = ({ open, onClose, onConversationCreated }: NewMessageDialogProps) => {
  const { t } = useTranslation();
  const { userModel: currentUser } = useCurrentUserContext();
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<UserFilterInput>();

  const [createConversation] = useCreateConversationMutation();

  const { data: contributors = [], loading: loadingContributors } = useContributors({
    filter,
    onlyUsersInRole: false,
    pageSize: 20,
  });

  // Filter out current user from the list
  const filteredContributors = useMemo(() => {
    return contributors.filter(user => user.id !== currentUser?.id);
  }, [contributors, currentUser?.id]);

  // Debounce the filter update
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
    if (value) {
      setSelectedUser({
        id: value.id,
        displayName: value.profile.displayName,
        avatarUri: value.profile.visual?.uri,
        city: value.profile.location?.city,
        country: value.profile.location?.country,
      });
      setInputValue('');
      setFilter(undefined);
    }
  };

  const handleClearUser = () => {
    setSelectedUser(null);
  };

  const [handleCreateChat, isCreating] = useLoadingState(async () => {
    if (!selectedUser) return;

    await createConversation({
      variables: {
        conversationData: {
          type: CommunicationConversationType.UserUser,
          userID: selectedUser.id,
        },
      },
    });

    onConversationCreated(selectedUser.id);
    handleClose();
  });

  const handleClose = () => {
    setSelectedUser(null);
    setInputValue('');
    setFilter(undefined);
    onClose();
  };

  return (
    <DialogWithGrid open={open} columns={8} onClose={handleClose} aria-labelledby="new-message-dialog">
      <DialogHeader
        id="new-message-dialog"
        title={t('components.userMessaging.newMessage' as TranslationKey)}
        onClose={handleClose}
      />
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={gutters()}>
          {/* User selector */}
          <Box>
            <Caption marginBottom={gutters(0.5)}>{t('components.userMessaging.selectUser' as TranslationKey)}</Caption>
            {selectedUser ? (
              <Chip
                avatar={
                  <Avatar
                    src={selectedUser.avatarUri}
                    alt={selectedUser.displayName}
                    size="medium"
                    sx={{ boxShadow: '0 0 2px rgba(0, 0, 0, 0.2)' }}
                  />
                }
                label={selectedUser.displayName}
                onDelete={handleClearUser}
                sx={{ marginTop: gutters(0.5) }}
              />
            ) : (
              <Autocomplete
                options={filteredContributors}
                getOptionLabel={option => option.profile.displayName}
                inputValue={inputValue}
                onInputChange={handleInputChange}
                onChange={handleUserSelect}
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
                      displayName={option.profile.displayName}
                      avatarUrl={option.profile.visual?.uri}
                      city={option.profile.location?.city}
                      country={option.profile.location?.country}
                    />
                  </li>
                )}
              />
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleCreateChat} disabled={!selectedUser || isCreating}>
          {t('components.userMessaging.createChat' as TranslationKey)}
        </Button>
      </DialogActions>
    </DialogWithGrid>
  );
};
