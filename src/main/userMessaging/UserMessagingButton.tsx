import { IconButton, Paper } from '@mui/material';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import { useTranslation } from 'react-i18next';
import BadgeCounter from '@/core/ui/icon/BadgeCounter';
import { useUserMessagingContext } from './UserMessagingContext';
import { useConversationsUnreadCount } from './useConversationsUnreadCount';

export const UserMessagingButton = () => {
  const { isEnabled, setIsOpen } = useUserMessagingContext();
  const unreadCount = useConversationsUnreadCount();
  const { t } = useTranslation();

  const openMessaging = () => {
    setIsOpen(true);
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <Paper
      component={IconButton}
      onClick={openMessaging}
      color="primary"
      aria-label={t('buttons.messages' as const)}
      sx={{
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          background: theme => theme.palette.background.paper,
          opacity: 0.9,
        },
      }}
    >
      <ChatOutlinedIcon />
      {unreadCount > 0 && (
        <BadgeCounter
          count={unreadCount}
          size="small"
          aria-label={`${unreadCount} unread chats`}
          sx={{ position: 'absolute', top: -4, right: -4 }}
        />
      )}
    </Paper>
  );
};
