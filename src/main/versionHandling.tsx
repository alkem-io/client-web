import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cleanupVersionUpdateListeners, onVersionUpdate, syncClientVersion } from '@/serviceWorker';
import NotificationView from '@/core/ui/notifications/NotificationView';
import { SnackbarContent, Button, Box } from '@mui/material';
import { info as logInfo, warn as logWarn } from '@/core/logging/sentry/log';
import { rem } from '@/core/ui/typography/utils';
import TranslationKey from '@/core/i18n/utils/TranslationKey';

const LAST_VERSION_MISMATCH_LS_KEY = 'lastVersionMismatch';

/**
 * Listens for service worker messages about new versions and triggers a notification.
 */
export const VersionHandling = () => {
  const { t } = useTranslation();
  const appVersion = import.meta.env.VITE_APP_VERSION;
  const [open, setOpenToast] = useState(false);
  const defaultMessageKey = 'snackbars.appVersion.message';
  const [messageKeys, setMessageKeys] = useState<TranslationKey[]>([defaultMessageKey]);

  const buildVersionMismatchPair = (oldVersion: string, newVersion: string) => {
    return `${oldVersion}|${newVersion}`;
  };
  const setLastVersionDetected = (oldVersion: string, newVersion: string) => {
    try {
      localStorage.setItem(LAST_VERSION_MISMATCH_LS_KEY, buildVersionMismatchPair(oldVersion, newVersion));
    } catch (_error) {
      logWarn('Failed to store version mismatch info while writing.', { label: 'VERSION_MISMATCH_STORAGE' });
    }
  };
  const getLastVersionDetected = () => {
    try {
      return localStorage.getItem(LAST_VERSION_MISMATCH_LS_KEY) || '';
    } catch (_error) {
      logWarn('Failed to read version mismatch info.', { label: 'VERSION_MISMATCH_STORAGE' });
      return '';
    }
  };
  const isRecurringMismatch = (oldVersion: string, newVersion: string) => {
    return getLastVersionDetected() === buildVersionMismatchPair(oldVersion, newVersion);
  };
  const setMessageBasedOnRecurringMismatch = (oldVersion: string, newVersion: string) => {
    if (isRecurringMismatch(oldVersion, newVersion)) {
      setMessageKeys([defaultMessageKey, 'snackbars.appVersion.recurringMessage']);
    } else {
      setMessageKeys([defaultMessageKey]);
    }
  };

  useEffect(() => {
    syncClientVersion(appVersion);

    onVersionUpdate(latestBuildVersion => {
      // this callback should be called only when there's a version mismatch
      // however in Sentry, there are logs with matching versions
      if (appVersion !== latestBuildVersion) {
        logInfo(`Current: ${appVersion}; New: ${latestBuildVersion};`, { label: 'VERSION_MISMATCH' });
        setMessageBasedOnRecurringMismatch(appVersion, latestBuildVersion);
        setOpenToast(true);
        setLastVersionDetected(appVersion, latestBuildVersion);
      }
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
        message={messageKeys.map((messageKey, i) => (
          <Box key={i}>{t(messageKey)}</Box>
        ))}
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
              // using window to avoid redundant re-rendering
              window.location.replace(window.location.pathname + window.location.search);
            }}
          >
            {t('pages.error.buttons.reload')}
          </Button>
        }
      />
    </NotificationView>
  );
};
