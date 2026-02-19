import { gql, useQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';

const VAPID_KEY_QUERY = gql`
  query PushNotificationVapidKey {
    pushNotificationVapidPublicKey
  }
`;

const SUBSCRIBE_MUTATION = gql`
  mutation SubscribeToPushNotifications($input: PushSubscriptionInput!) {
    subscribeToPushNotifications(input: $input)
  }
`;

const UNSUBSCRIBE_MUTATION = gql`
  mutation UnsubscribeFromPushNotifications($endpoint: String!) {
    unsubscribeFromPushNotifications(endpoint: $endpoint)
  }
`;

interface VapidKeyData {
  pushNotificationVapidPublicKey: string;
}

export type PushPermissionState = NotificationPermission | 'unsupported';

/**
 * Convert a base64 URL-encoded string to a Uint8Array for the Push API.
 */
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}

function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export const usePushNotifications = () => {
  const { userModel } = useCurrentUserContext();
  const isAuthenticated = Boolean(userModel?.id);

  const [permissionState, setPermissionState] = useState<PushPermissionState>(() =>
    isPushSupported() ? Notification.permission : 'unsupported'
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const subscribedRef = useRef(false);

  const { data: vapidData } = useQuery<VapidKeyData>(VAPID_KEY_QUERY, {
    skip: !isAuthenticated || !isPushSupported(),
    fetchPolicy: 'cache-first',
  });

  const vapidPublicKey = vapidData?.pushNotificationVapidPublicKey ?? '';
  const isPushConfigured = Boolean(vapidPublicKey);

  const [subscribeMutation] = useMutation(SUBSCRIBE_MUTATION);
  const [unsubscribeMutation] = useMutation(UNSUBSCRIBE_MUTATION);

  // Check initial subscription state
  useEffect(() => {
    if (!isPushSupported() || !isAuthenticated) return;

    navigator.serviceWorker.ready.then(async registration => {
      const subscription = await registration.pushManager.getSubscription();
      const subscribed = Boolean(subscription);
      setIsSubscribed(subscribed);
      subscribedRef.current = subscribed;
    });
  }, [isAuthenticated]);

  /**
   * Subscribe to push notifications.
   * Requests permission from the user if not already granted,
   * subscribes via the Push API, and sends the subscription to the server.
   */
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported() || !isPushConfigured || !isAuthenticated) {
      return false;
    }

    setIsLoading(true);
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setPermissionState(permission);

      if (permission !== 'granted') {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const json = subscription.toJSON();
      const keys = json.keys ?? {};

      // Send subscription to server
      await subscribeMutation({
        variables: {
          input: {
            endpoint: subscription.endpoint,
            p256dh: keys.p256dh ?? '',
            auth: keys.auth ?? '',
          },
        },
      });

      setIsSubscribed(true);
      subscribedRef.current = true;
      return true;
    } catch (error) {
      console.error('[Push] Failed to subscribe:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isPushConfigured, isAuthenticated, vapidPublicKey, subscribeMutation]);

  /**
   * Unsubscribe from push notifications.
   */
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported() || !isAuthenticated) {
      return false;
    }

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Notify server first
        await unsubscribeMutation({
          variables: { endpoint: subscription.endpoint },
        });
        // Then unsubscribe locally
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      subscribedRef.current = false;
      return true;
    } catch (error) {
      console.error('[Push] Failed to unsubscribe:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, unsubscribeMutation]);

  return {
    /** Whether the browser supports push notifications */
    isSupported: isPushSupported(),
    /** Whether the server has VAPID configured and push is available */
    isPushConfigured,
    /** Current browser permission state */
    permissionState,
    /** Whether the user has an active push subscription */
    isSubscribed,
    /** Whether a subscribe/unsubscribe operation is in progress */
    isLoading,
    /** Subscribe to push notifications (requests permission + subscribes + registers with server) */
    subscribe,
    /** Unsubscribe from push notifications */
    unsubscribe,
  };
};
