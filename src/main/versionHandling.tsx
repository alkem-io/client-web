import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cleanupVersionUpdateListeners, onVersionUpdate, syncClientVersion } from '@/serviceWorker';
import NotificationView from '@/core/ui/notifications/NotificationView';
import { SnackbarContent, Button } from '@mui/material';
import { info as logInfo } from '@/core/logging/sentry/log';
import { rem } from '@/core/ui/typography/utils';

/**
 * Listens for service worker messages about new versions and triggers a notification.
 */
export const VersionHandling = () => {
  const { t } = useTranslation();
  const appVersion = import.meta.env.VITE_APP_VERSION;
  const [open, setOpenToast] = useState(false);

  useEffect(() => {
    syncClientVersion(appVersion);

    onVersionUpdate(version => {
      logInfo(`New: ${version}; Current: ${appVersion}`, { label: 'VERSION_MISMATCH' });
      setOpenToast(true);
    });

    return () => cleanupVersionUpdateListeners();
  }, []);

  if (!open) {
    return null;
  }

  return (
    <NotificationView
      open={open}
      onClose={(_, reason) => {
        if (reason === 'clickaway') return;
        setOpenToast(false);
      }}
      autoHideDuration={null}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <SnackbarContent
        message={t('snackbars.appVersion.message')}
        sx={{
          backgroundColor: 'highlight.dark',
          color: 'white',
          fontSize: rem(15),
        }}
        action={
          <Button
            sx={{
              color: 'white',
            }}
            onClick={() => {
              window.location.reload();
            }}
          >
            {t('pages.error.buttons.reload')}
          </Button>
        }
      />
    </NotificationView>
  );
};
