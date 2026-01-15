import { Badge, IconButton, Paper } from '@mui/material';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import { useTranslation } from 'react-i18next';
import { useUserMessagingContext } from './UserMessagingContext';

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
      <Badge
        badgeContent={totalUnreadCount}
        color="error"
        max={99}
        invisible={totalUnreadCount === 0}
        sx={{
          '& .MuiBadge-badge': {
            fontSize: '0.65rem',
            height: 16,
            minWidth: 16,
          },
        }}
      >
        <ChatOutlinedIcon />
      </Badge>
    </Paper>
  );
};
