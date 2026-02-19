import { Box, Button, Switch, Typography, Alert } from '@mui/material';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { usePushNotifications } from './usePushNotifications';
import { useTranslation } from 'react-i18next';

/**
 * Renders a push notification toggle/banner that allows users to
 * enable or disable browser push notifications.
 *
 * Shows different states:
 * - Unsupported browser: informational alert
 * - Not configured (no VAPID key): hidden
 * - Permission denied: informational alert explaining how to re-enable in browser settings
 * - Permission default (not asked): enable button
 * - Permission granted + subscribed: toggle switch to disable
 */
export const PushNotificationSettings = () => {
  const { isSupported, isPushConfigured, permissionState, isSubscribed, isLoading, subscribe, unsubscribe } =
    usePushNotifications();
  const { t } = useTranslation();

  // If push isn't configured on the server, don't show anything
  if (!isPushConfigured) {
    return null;
  }

  if (!isSupported) {
    return (
      <Alert severity="info" sx={{ mt: 1 }}>
        {t('pages.admin.user.notifications.push.unsupported', {
          defaultValue: 'Push notifications are not supported by your browser.',
        })}
      </Alert>
    );
  }

  if (permissionState === 'denied') {
    return (
      <Alert severity="warning" sx={{ mt: 1 }}>
        {t('pages.admin.user.notifications.push.denied', {
          defaultValue:
            'Push notifications are blocked. To enable them, update your browser notification settings for this site.',
        })}
      </Alert>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        mt: 1,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <NotificationsActiveOutlinedIcon color="primary" />
        <Box>
          <Typography variant="body1" fontWeight={500}>
            {t('pages.admin.user.notifications.push.title', {
              defaultValue: 'Push Notifications',
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('pages.admin.user.notifications.push.description', {
              defaultValue: 'Receive notifications in your browser even when the tab is not active.',
            })}
          </Typography>
        </Box>
      </Box>

      {permissionState === 'default' && !isSubscribed ? (
        <Button variant="outlined" size="small" onClick={handleToggle} disabled={isLoading}>
          {t('pages.admin.user.notifications.push.enable', {
            defaultValue: 'Enable',
          })}
        </Button>
      ) : (
        <Switch checked={isSubscribed} onChange={handleToggle} disabled={isLoading} />
      )}
    </Box>
  );
};
