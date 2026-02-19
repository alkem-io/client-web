import { useEffect, useRef } from 'react';
import { usePushNotifications } from './usePushNotifications';

/**
 * Silent component that automatically manages push notification subscriptions.
 *
 * If the user has previously granted notification permission and is authenticated,
 * this component will ensure the push subscription is registered with the server.
 * This handles cases where the service worker re-subscribes (e.g. after browser update).
 *
 * Place this component inside the authenticated + Apollo provider context.
 */
export const PushNotificationSubscriber = () => {
  const { isSupported, isPushConfigured, permissionState, isSubscribed, subscribe } = usePushNotifications();
  const hasAttempted = useRef(false);

  useEffect(() => {
    // Auto-resubscribe if the user previously granted permission but isn't currently subscribed
    if (
      isSupported &&
      isPushConfigured &&
      permissionState === 'granted' &&
      !isSubscribed &&
      !hasAttempted.current
    ) {
      hasAttempted.current = true;
      subscribe().catch(() => {
        // Silently ignore — the hook already logs errors
      });
    }
  }, [isSupported, isPushConfigured, permissionState, isSubscribed, subscribe]);

  return null;
};
