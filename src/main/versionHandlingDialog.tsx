import { useEffect } from 'react';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { EventTypes } from '@/serviceWorker';

/**
 * Listens for service worker messages about new versions and triggers a notification.
 */
export const VersionHandlingDialog = () => {
  const notify = useNotification();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handler = (event: MessageEvent) => {
        if (event.data?.type === EventTypes.NEW_VERSION_AVAILABLE) {
          notify('A new version of the app is available. Please reload to update.');
        }
      };
      navigator.serviceWorker.addEventListener('message', handler);

      return () => {
        navigator.serviceWorker.removeEventListener('message', handler);
      };
    }
  }, []);

  return null;
};
