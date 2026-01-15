import { IconButton, Paper } from '@mui/material';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import { useTranslation } from 'react-i18next';
import { useUserMessagingContext } from './UserMessagingContext';
import BadgeCounter from '@/core/ui/icon/BadgeCounter';

export const UserMessagingButton = () => {
  const { isEnabled, setIsOpen, totalUnreadCount } = useUserMessagingContext();
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
      {totalUnreadCount > 0 && (
        <BadgeCounter
          count={totalUnreadCount}
          size="small"
          aria-label={`${totalUnreadCount} unread chats`}
          sx={{ position: 'absolute', top: -4, right: -4 }}
        />
      )}
    </Paper>
  );
};
