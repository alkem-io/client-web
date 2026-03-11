import CloseIcon from '@mui/icons-material/Close';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import { IconButton, SnackbarContent } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { info as sentryInfo } from '@/core/logging/sentry/log';
import NotificationView from '@/core/ui/notifications/NotificationView';
import { rem } from '@/core/ui/typography/utils';
import useOnlineStatus from '@/core/utils/onlineStatus';

const OFFLINE_DEBOUNCE_MS = 3000; // Only show offline toast after 3 s sustained disconnection
const ONLINE_RESTORED_TIMEOUT = 6000;
const SENTRY_ONLINE_RESTORED_LS_KEY = 'lastOnlineRestoredLog';
const SENTRY_ONLINE_RESTORED_THROTTLE_MS = 30 * 1000; // 30 seconds

type NotificationState = 'idle' | 'offline' | 'restored';

/**
 * Tracks browser online/offline events and shows a non-intrusive toast:
 * - Offline  → persistent white toast, grey text, top-center (debounced — only after 3 s sustained)
 * - Restored → white toast, green text, auto-dismisses after 6 s (only if offline toast was shown)
 *
 * Logs a single Sentry info event per restored-session, throttled to avoid noise.
 */
export const OnlineStatusNotification = () => {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const offlineShown = useRef(false);
  const offlineTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [state, setState] = useState<NotificationState>('idle');

  useEffect(() => {
    if (!isOnline) {
      // Debounce: only show offline toast after sustained disconnection
      offlineTimerRef.current = setTimeout(() => {
        offlineShown.current = true;
        setState('offline');
      }, OFFLINE_DEBOUNCE_MS);
      return () => clearTimeout(offlineTimerRef.current);
    }

    // Came back online — cancel pending offline toast if it hasn't fired yet
    clearTimeout(offlineTimerRef.current);

    // Only show "restored" if the offline toast was actually displayed
    if (offlineShown.current) {
      offlineShown.current = false;
      setState('restored');

      // Throttled Sentry log — at most once per 30 seconds
      try {
        const lastLog = Number(localStorage.getItem(SENTRY_ONLINE_RESTORED_LS_KEY) ?? '0');
        if (Date.now() - lastLog > SENTRY_ONLINE_RESTORED_THROTTLE_MS) {
          sentryInfo('Connection restored after offline period', { label: 'ONLINE_STATUS' });
          localStorage.setItem(SENTRY_ONLINE_RESTORED_LS_KEY, String(Date.now()));
        }
      } catch {
        // localStorage unavailable — skip silently
      }
    }
  }, [isOnline]);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setState('idle');
  };

  if (state === 'idle') return null;

  const isOffline = state === 'offline';

  return (
    <NotificationView
      open={true}
      onClose={handleClose}
      autoHideDuration={isOffline ? null : ONLINE_RESTORED_TIMEOUT}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <SnackbarContent
        message={
          <>
            {isOffline ? (
              <WifiOffIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
            ) : (
              <WifiIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
            )}
            {t(isOffline ? 'snackbars.onlineStatus.offline' : 'snackbars.onlineStatus.restored')}
          </>
        }
        sx={{
          backgroundColor: 'white',
          color: isOffline ? 'grey.600' : 'success.main',
          fontSize: rem(15),
          boxShadow: 3,
          '& .MuiSnackbarContent-message': {
            display: 'flex',
            alignItems: 'center',
          },
        }}
        action={
          <IconButton size="small" aria-label={t('buttons.close')} onClick={handleClose} sx={{ color: 'inherit' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </NotificationView>
  );
};
