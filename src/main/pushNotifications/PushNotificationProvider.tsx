import { createContext, type FC, type PropsWithChildren, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useMyPushSubscriptionsLazyQuery,
  useSubscribeToPushNotificationsMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { type PushNotificationState, usePushNotifications } from '@/main/pushNotifications/usePushNotifications';

const PUSH_SUBSCRIPTION_ID_KEY = 'alkemio_push_subscription_id';

const defaultState: PushNotificationState = {
  isSupported: false,
  isServerEnabled: false,
  permissionState: 'default',
  isSubscribed: false,
  currentSubscriptionId: null,
  subscribe: async () => {},
  unsubscribe: async () => {},
  loading: false,
  requiresPWAMode: false,
  isPrivateBrowsing: false,
};

const PushNotificationContext = createContext<PushNotificationState>(defaultState);

export const usePushNotificationContext = () => useContext(PushNotificationContext);

const PushNotificationProviderInner: FC<PropsWithChildren> = ({ children }) => {
  const pushState = usePushNotifications();
  const navigate = useNavigate();
  const [fetchSubscriptions] = useMyPushSubscriptionsLazyQuery();
  const [subscribeMutation] = useSubscribeToPushNotificationsMutation();

  // Silent refresh on mount: validate/restore push subscription
  useEffect(() => {
    if (!pushState.isSupported || !pushState.isServerEnabled) return;
    if (Notification.permission !== 'granted') return;

    const silentRefresh = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          // No browser subscription and permission is granted — use the hook's subscribe
          // to silently re-create and register with server
          await pushState.subscribe();
          return;
        }

        // Browser subscription exists — verify it's registered on the server
        const { data } = await fetchSubscriptions();
        const serverSubscriptions = data?.myPushSubscriptions ?? [];
        const cachedId = localStorage.getItem(PUSH_SUBSCRIPTION_ID_KEY);
        const matchingServer = cachedId ? serverSubscriptions.find(sub => sub.id === cachedId) : undefined;

        if (!matchingServer) {
          // No matching server record — re-register this browser's subscription
          const subscriptionJSON = subscription.toJSON();
          const result = await subscribeMutation({
            variables: {
              subscriptionData: {
                endpoint: subscriptionJSON.endpoint!,
                p256dh: subscriptionJSON.keys?.p256dh ?? '',
                auth: subscriptionJSON.keys?.auth ?? '',
                userAgent: navigator.userAgent,
              },
            },
          });
          const newId = result.data?.subscribeToPushNotifications?.id;
          if (newId) {
            localStorage.setItem(PUSH_SUBSCRIPTION_ID_KEY, newId);
          }
        }
      } catch {
        // Silent refresh failures are non-critical
      }
    };

    silentRefresh();
  }, [pushState.isSupported, pushState.isServerEnabled]);

  // Listen for service worker messages
  useEffect(() => {
    if (!pushState.isSupported) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PUSH_NOTIFICATION_CLICK' && event.data.url) {
        navigate(event.data.url);
      }

      if (event.data?.type === 'PUSH_SUBSCRIPTION_CHANGED' && event.data.subscription) {
        // Re-register the new subscription with server
        const sub = event.data.subscription;
        subscribeMutation({
          variables: {
            subscriptionData: {
              endpoint: sub.endpoint,
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
              userAgent: navigator.userAgent,
            },
          },
        })
          .then(result => {
            const newId = result.data?.subscribeToPushNotifications?.id;
            if (newId) {
              localStorage.setItem(PUSH_SUBSCRIPTION_ID_KEY, newId);
            }
          })
          .catch(() => {
            // Non-critical
          });
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, [pushState.isSupported, navigate, subscribeMutation]);

  return <PushNotificationContext.Provider value={pushState}>{children}</PushNotificationContext.Provider>;
};

export const PushNotificationProvider: FC<PropsWithChildren> = ({ children }) => {
  const { isAuthenticated } = useCurrentUserContext();

  if (!isAuthenticated) {
    return <PushNotificationContext.Provider value={defaultState}>{children}</PushNotificationContext.Provider>;
  }

  return <PushNotificationProviderInner>{children}</PushNotificationProviderInner>;
};
