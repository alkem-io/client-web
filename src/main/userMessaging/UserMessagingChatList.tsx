import { useState } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Typography,
  IconButton,
  InputBase,
  InputAdornment,
} from '@mui/material';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import Avatar from '@/core/ui/avatar/Avatar';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import { gutters } from '@/core/ui/grid/utils';
import { Caption, BlockTitle } from '@/core/ui/typography';
import Loading from '@/core/ui/loading/Loading';
import Gutters from '@/core/ui/grid/Gutters';
import { UserConversation } from './useUserConversations';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { useScreenSize } from '@/core/ui/grid/constants';
import BadgeCounter from '@/core/ui/icon/BadgeCounter';

interface UserMessagingChatListProps {
  conversations: UserConversation[];
  isLoading: boolean;
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewMessage?: () => void;
}

export const UserMessagingChatList = ({
  conversations,
  isLoading,
  selectedConversationId,
  onSelectConversation,
  onNewMessage,
}: UserMessagingChatListProps) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const { isSmallScreen: isMobile } = useScreenSize();

  const filteredConversations = !searchTerm.trim()
    ? conversations
    : conversations.filter(conversation =>
        conversation.user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const searchInput = (
    <Box padding={gutters()} sx={{ boxShadow: '0 2px 2px 0 rgba(0, 0, 0, 0.15) inset' }}>
      <InputBase
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder={t('components.userMessaging.searchConversations' as TranslationKey)}
        fullWidth
        sx={{
          height: 30,
          backgroundColor: theme => theme.palette.background.default,
          borderRadius: 1,
          paddingX: 1,
          border: theme => `1px solid ${theme.palette.divider}`,
        }}
        endAdornment={
          searchTerm ? (
            <InputAdornment position="end">
              <IconButton
                onClick={handleClearSearch}
                size="small"
                aria-label={t('buttons.close')}
                sx={{ padding: 0.25 }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </InputAdornment>
          ) : null
        }
      />
    </Box>
  );

  const headerContent = (
    <Box
      display="flex"
      justifyContent={isMobile ? 'flex-start' : 'space-between'}
      alignItems="center"
      paddingY={gutters(0.5)}
      paddingX={gutters()}
      sx={{
        height: 80,
        borderBottom: theme => `1px solid ${theme.palette.divider}`,
      }}
    >
      <BlockTitle>{t('components.userMessaging.title' as TranslationKey)}</BlockTitle>
      <IconButton
        onClick={onNewMessage}
        size="small"
        aria-label={t('components.userMessaging.newMessage' as TranslationKey)}
        title={t('components.userMessaging.newMessage' as TranslationKey)}
        color="primary"
        sx={{
          margin: isMobile ? '0 20px' : 0,
        }}
      >
        <EditNoteOutlinedIcon fontSize="large" />
      </IconButton>
    </Box>
  );

  if (isLoading && conversations.length === 0) {
    return (
      <>
        {headerContent}
        <Gutters alignItems="center" paddingY={gutters(2)}>
          <Loading />
        </Gutters>
      </>
    );
  }

  if (conversations.length === 0) {
    return (
      <Box display="flex" flexDirection="column" height="100%">
        {headerContent}
        <Gutters alignItems="center" paddingY={gutters(2)}>
          <Caption>{t('components.userMessaging.noConversations' as TranslationKey)}</Caption>
        </Gutters>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {headerContent}
      {searchInput}
      <List disablePadding sx={{ width: '100%', overflowY: 'auto', flex: 1 }}>
        {filteredConversations.map(conversation => (
          <ListItemButton
            key={conversation.id}
            selected={selectedConversationId === conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            sx={{
              paddingX: gutters(),
              paddingY: gutters(0.5),
              '&.Mui-selected': {
                backgroundColor: theme => theme.palette.highlight.light,
              },
            }}
          >
            <ListItemAvatar sx={{ minWidth: 48 }}>
              <Avatar
                src={conversation.user.avatarUri}
                alt={conversation.user.displayName}
                size="medium"
                sx={{ boxShadow: '0 0px 2px rgba(0, 0, 0, 0.2)' }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" fontWeight={500} noWrap sx={{ maxWidth: '60%' }}>
                    {conversation.user.displayName}
                  </Typography>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-end"
                    gap={0.5}
                    sx={{ position: 'relative' }}
                  >
                    {conversation.lastMessage && (
                      <Caption color="neutral.light">
                        {formatTimeElapsed(new Date(conversation.lastMessage.timestamp), t)}
                      </Caption>
                    )}
                    {conversation.unreadCount > 0 && (
                      <BadgeCounter
                        count={conversation.unreadCount}
                        size="small"
                        aria-label={`${conversation.unreadCount} unread messages`}
                        sx={{
                          position: 'absolute',
                          top: 20,
                          right: 2,
                          backgroundColor: theme => theme.palette.primary.main,
                        }}
                      />
                    )}
                  </Box>
                </Box>
              }
              secondary={
                conversation.lastMessage ? (
                  <Typography
                    variant="body2"
                    fontWeight={conversation.unreadCount > 0 ? 600 : 400}
                    noWrap
                    sx={{ maxWidth: '90%' }}
                  >
                    {conversation.lastMessage.message}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="neutral.light" fontStyle="italic">
                    {t('components.userMessaging.noMessages' as TranslationKey)}
                  </Typography>
                )
              }
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};
