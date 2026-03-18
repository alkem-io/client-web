import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { IconButton, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import BadgeCounter from '@/core/ui/icon/BadgeCounter';
import { useInAppNotificationsContext } from '@/main/inAppNotifications/InAppNotificationsContext';
import { useInAppNotifications } from '@/main/inAppNotifications/useInAppNotifications';

export const PlatformNotificationsButton = () => {
  const { isEnabled, setIsOpen } = useInAppNotificationsContext();
  const { unreadCount } = useInAppNotifications();
  const { t } = useTranslation();

  const openNotifications = () => {
    setIsOpen(true);
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <Paper
      component={IconButton}
      onClick={openNotifications}
      color="primary"
      aria-label={t('buttons.notifications')}
      sx={{
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          background: theme => theme.palette.background.paper,
          opacity: 0.9,
        },
      }}
    >
      <NotificationsNoneOutlinedIcon />
      {unreadCount > 0 && (
        <BadgeCounter count={unreadCount} size="small" sx={{ position: 'absolute', top: -4, right: -4 }} />
      )}
    </Paper>
  );
};
