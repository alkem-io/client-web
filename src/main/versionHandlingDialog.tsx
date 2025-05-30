import { useEffect } from 'react';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { cleanupVersionUpdateListeners, onVersionUpdate, syncClientVersion } from '@/serviceWorker';

/**
 * Listens for service worker messages about new versions and triggers a notification.
 */
export const VersionHandlingDialog = () => {
  const appVersion = import.meta.env.VITE_APP_VERSION;
  const notify = useNotification();

  useEffect(() => {
    syncClientVersion(appVersion);

    onVersionUpdate(version => {
      // todo: log in sentry
      console.info(`New App version available: ${version}, current: ${appVersion}`);
      // todo: design TBD
      notify('A new version of the app is available. Please refresh the page to update.');
    });

    return () => cleanupVersionUpdateListeners();
  }, []);

  return null;
};
