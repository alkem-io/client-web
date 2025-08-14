import { IconButton, Paper } from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useTranslation } from 'react-i18next';
import BadgeCounter from '@/core/ui/icon/BadgeCounter';
import { useInAppNotifications } from '@/main/inAppNotifications/useInAppNotifications';
import { useInAppNotificationsContext } from '@/main/inAppNotifications/InAppNotificationsContext';
import { NotificationEventInAppState } from '@/core/apollo/generated/graphql-schema';

export const PlatformNotificationsButton = () => {
  const { isEnabled, setIsOpen } = useInAppNotificationsContext();
  const { items } = useInAppNotifications();
  const { t } = useTranslation();

  const openNotifications = () => {
    setIsOpen(true);
  };

  const unreadNotificationsCount = items.filter(item => item.state === NotificationEventInAppState.Unread).length;

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
      {unreadNotificationsCount > 0 && (
        <BadgeCounter count={unreadNotificationsCount} size="small" sx={{ position: 'absolute', top: -4, right: -4 }} />
      )}
    </Paper>
  );
};
