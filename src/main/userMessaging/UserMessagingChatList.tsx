import { Box, List, ListItemButton, ListItemAvatar, ListItemText, Typography, IconButton } from '@mui/material';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import { useTranslation } from 'react-i18next';
import Avatar from '@/core/ui/avatar/Avatar';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import Loading from '@/core/ui/loading/Loading';
import Gutters from '@/core/ui/grid/Gutters';
import { UserConversation } from './useUserConversations';
import TranslationKey from '@/core/i18n/utils/TranslationKey';

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

  const headerContent = (
    <Box
      display="flex"
      justifyContent="flex-end"
      alignItems="center"
      padding={gutters(0.5)}
      paddingX={gutters()}
      borderBottom={theme => `1px solid ${theme.palette.divider}`}
    >
      <IconButton
        onClick={onNewMessage}
        size="small"
        aria-label={t('components.userMessaging.newMessage' as TranslationKey)}
        title={t('components.userMessaging.newMessage' as TranslationKey)}
        color="primary"
      >
        <AddCommentOutlinedIcon />
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
      <>
        {headerContent}
        <Gutters alignItems="center" paddingY={gutters(2)}>
          <Caption>{t('components.userMessaging.noConversations' as TranslationKey)}</Caption>
        </Gutters>
      </>
    );
  }

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {headerContent}
      <List disablePadding sx={{ width: '100%', overflowY: 'auto', flex: 1 }}>
        {conversations.map(conversation => (
          <ListItemButton
            key={conversation.id}
            selected={selectedConversationId === conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            sx={{
              paddingX: gutters(),
              paddingY: gutters(0.5),
              borderBottom: theme => `1px solid ${theme.palette.divider}`,
              '&.Mui-selected': {
                backgroundColor: theme => theme.palette.highlight.light,
              },
            }}
          >
            <ListItemAvatar sx={{ minWidth: 48 }}>
              <Avatar
                src={conversation.user.avatarUri}
                alt={conversation.user.displayName}
                sx={{ width: 40, height: 40 }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" fontWeight={500} noWrap sx={{ maxWidth: '60%' }}>
                    {conversation.user.displayName}
                  </Typography>
                  {conversation.lastMessage && (
                    <Caption color="neutral.light">
                      {formatTimeElapsed(new Date(conversation.lastMessage.timestamp), t)}
                    </Caption>
                  )}
                </Box>
              }
              secondary={
                conversation.lastMessage ? (
                  <Typography variant="body2" color="neutral.main" noWrap sx={{ maxWidth: '90%' }}>
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
