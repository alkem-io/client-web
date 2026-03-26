import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUnsubscribeFromPushNotificationsMutation } from '@/core/apollo/generated/apollo-hooks';
import { useLogoutUrl } from '@/core/auth/authentication/hooks/useLogoutUrl';
import { useReturnUrl } from '@/core/auth/authentication/utils/useSignUpReturnUrl';
import Loading from '@/core/ui/loading/Loading';

const PUSH_SUBSCRIPTION_ID_KEY = 'alkemio_push_subscription_id';

async function cleanupPushSubscription(
  unsubscribeMutation: ReturnType<typeof useUnsubscribeFromPushNotificationsMutation>[0]
) {
  try {
    const subscriptionId = sessionStorage.getItem(PUSH_SUBSCRIPTION_ID_KEY);

    if (subscriptionId) {
      await unsubscribeMutation({
        variables: { subscriptionData: { subscriptionID: subscriptionId } },
      }).catch(() => {});
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
    }
  } finally {
    // Always clear the cached ID, even if cleanup partially fails
    sessionStorage.removeItem(PUSH_SUBSCRIPTION_ID_KEY);
  }
}

const LogoutPage = () => {
  const { t } = useTranslation();

  const { getLogoutUrl, logoutUrl, error } = useLogoutUrl();
  const { clearReturnUrl } = useReturnUrl();
  const [unsubscribeMutation] = useUnsubscribeFromPushNotificationsMutation();

  useEffect(() => {
    if (logoutUrl) {
      // Wait for push cleanup before redirecting to avoid leaving stale subscriptions
      cleanupPushSubscription(unsubscribeMutation).finally(() => {
        clearReturnUrl();
        window.location.replace(logoutUrl);
      });
    } else {
      getLogoutUrl();
    }
    return () => {};
  }, [logoutUrl]);

  if (error) return <Typography>{String(error)}</Typography>;
  return <Loading text={t('pages.logout.loading')} />;
};

export default LogoutPage;
