import { IconButton, Paper } from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useTranslation } from 'react-i18next';
import BadgeCounter from '../../../core/ui/icon/BadgeCounter';
import { InAppNotificationState, useInAppNotifications } from '../../inAppNotifications/useInAppNotifications';
import { useInAppNotificationsContext } from '../../inAppNotifications/InAppNotificationsContext';

export const PlaformNotificationsButton = () => {
  const { t } = useTranslation();
  const { setIsOpen } = useInAppNotificationsContext();
  const { items } = useInAppNotifications();

  const openNotifications = () => {
    setIsOpen(true);
  };

  const unreadNotificationsCount = items.filter(item => item.state === InAppNotificationState.Unread).length;

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
