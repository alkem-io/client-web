import { useCallback, useEffect, useState } from 'react';
import {
  useSubscribeToPushNotificationsMutation,
  useUnsubscribeFromPushNotificationsMutation,
  useVapidPublicKeyQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { PUSH_SUBSCRIPTION_ID_KEY, PUSH_USER_DISABLED_KEY } from '@/main/pushNotifications/constants';
import { urlBase64ToUint8Array } from '@/main/pushNotifications/urlBase64ToUint8Array';

export type PushNotificationState = {
  isSupported: boolean;
  isServerEnabled: boolean;
  permissionState: NotificationPermission;
  isSubscribed: boolean;
  currentSubscriptionId: string | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  loading: boolean;
  requiresPWAMode: boolean;
  isPrivateBrowsing: boolean;
};

function detectIOSNonPWA(): boolean {
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = 'standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true;
  return isIOS && !isStandalone;
}

export function usePushNotifications(): PushNotificationState {
  const isSupported = 'PushManager' in window && 'serviceWorker' in navigator && 'Notification' in window;

  const { data: vapidData, loading: vapidLoading } = useVapidPublicKeyQuery({ skip: !isSupported });
  const vapidPublicKey = vapidData?.vapidPublicKey ?? null;
  const isServerEnabled = vapidPublicKey !== null;

  const [subscribeMutation] = useSubscribeToPushNotificationsMutation();
  const [unsubscribeMutation] = useUnsubscribeFromPushNotificationsMutation();

  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    isSupported ? Notification.permission : 'default'
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentSubscriptionId, setCurrentSubscriptionId] = useState<string | null>(
    localStorage.getItem(PUSH_SUBSCRIPTION_ID_KEY)
  );
  const [loading, setLoading] = useState(false);
  const [requiresPWAMode] = useState(detectIOSNonPWA);
  const [isPrivateBrowsing, setIsPrivateBrowsing] = useState(false);

  // Detect private browsing
  useEffect(() => {
    if (!isSupported || typeof navigator.storage?.estimate !== 'function') return;
    navigator.storage
      .estimate()
      .then(estimate => {
        // In private browsing, quota is typically very limited
        if (estimate.quota !== undefined && estimate.quota < 120_000_000) {
          setIsPrivateBrowsing(true);
        }
      })
      .catch(() => {
        // storage.estimate() not available — can't detect
      });
  }, [isSupported]);

  // Check initial subscription state
  useEffect(() => {
    if (!isSupported || !isServerEnabled) return;

    navigator.serviceWorker.ready
      .then(registration => registration.pushManager.getSubscription())
      .then(subscription => setIsSubscribed(subscription !== null))
      .catch(() => {
        // Non-critical: SW or push manager unavailable
      });
  }, [isSupported, isServerEnabled]);

  const subscribe = useCallback(async () => {
    if (!isSupported || !vapidPublicKey) return;

    setLoading(true);
    let browserSubscription: PushSubscription | null = null;

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);

      if (permission !== 'granted') {
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      browserSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any,
      });

      const subscriptionJSON = browserSubscription.toJSON();
      if (!subscriptionJSON.endpoint) {
        throw new Error('Push subscription has no endpoint');
      }
      const result = await subscribeMutation({
        variables: {
          subscriptionData: {
            endpoint: subscriptionJSON.endpoint,
            p256dh: subscriptionJSON.keys?.p256dh ?? '',
            auth: subscriptionJSON.keys?.auth ?? '',
            userAgent: navigator.userAgent,
          },
        },
      });

      const serverSubscriptionId = result.data?.subscribeToPushNotifications?.id;
      if (serverSubscriptionId) {
        localStorage.setItem(PUSH_SUBSCRIPTION_ID_KEY, serverSubscriptionId);
        setCurrentSubscriptionId(serverSubscriptionId);
      }
      localStorage.removeItem(PUSH_USER_DISABLED_KEY);
      setIsSubscribed(true);
    } catch (error) {
      // FR-014: Rollback browser subscription on server error
      if (browserSubscription) {
        try {
          await browserSubscription.unsubscribe();
        } catch {
          // Best effort rollback
        }
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isSupported, vapidPublicKey, subscribeMutation]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    try {
      const subscriptionId = currentSubscriptionId ?? localStorage.getItem(PUSH_SUBSCRIPTION_ID_KEY);

      // If no cached ID, we can't safely identify which server record belongs to this device
      // (the server doesn't expose the push endpoint for matching).
      // We still remove the browser-side subscription; the orphaned server record
      // will be cleaned up when the server detects delivery failure.

      if (subscriptionId) {
        await unsubscribeMutation({
          variables: {
            subscriptionData: { subscriptionID: subscriptionId },
          },
        });
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      localStorage.removeItem(PUSH_SUBSCRIPTION_ID_KEY);
      localStorage.setItem(PUSH_USER_DISABLED_KEY, 'true');
      setCurrentSubscriptionId(null);
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, [currentSubscriptionId, unsubscribeMutation]);

  return {
    isSupported,
    isServerEnabled: isServerEnabled && !vapidLoading,
    permissionState,
    isSubscribed,
    currentSubscriptionId,
    subscribe,
    unsubscribe,
    loading,
    requiresPWAMode,
    isPrivateBrowsing,
  };
}
