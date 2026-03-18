import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLogoutUrl } from '@/core/auth/authentication/hooks/useLogoutUrl';
import { useReturnUrl } from '@/core/auth/authentication/utils/useSignUpReturnUrl';
import Loading from '@/core/ui/loading/Loading';
import { useUnsubscribeFromPushNotificationsMutation } from '@/core/apollo/generated/apollo-hooks';

const PUSH_SUBSCRIPTION_ID_KEY = 'alkemio_push_subscription_id';

async function cleanupPushSubscription(
  unsubscribeMutation: ReturnType<typeof useUnsubscribeFromPushNotificationsMutation>[0]
) {
  try {
    const subscriptionId = sessionStorage.getItem(PUSH_SUBSCRIPTION_ID_KEY);

    if (subscriptionId) {
      // Fire-and-forget: don't block logout on server cleanup
      unsubscribeMutation({
        variables: { subscriptionData: { subscriptionID: subscriptionId } },
      }).catch(() => {});
    }

    // Clean up browser-side subscription
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
    }

    sessionStorage.removeItem(PUSH_SUBSCRIPTION_ID_KEY);
  } catch {
    // Non-critical: don't block logout
  }
}

const LogoutPage = () => {
  const { t } = useTranslation();

  const { getLogoutUrl, logoutUrl, error } = useLogoutUrl();
  const { clearReturnUrl } = useReturnUrl();
  const [unsubscribeMutation] = useUnsubscribeFromPushNotificationsMutation();

  useEffect(() => {
    if (logoutUrl) {
      // Clean up push subscription before redirecting (fire-and-forget)
      cleanupPushSubscription(unsubscribeMutation);
      clearReturnUrl();
      window.location.replace(logoutUrl);
    } else {
      getLogoutUrl();
    }
    return () => {};
  }, [logoutUrl, getLogoutUrl]);

  if (error)
    return (
      <Typography>
        <>{error}</>
      </Typography>
    );
  return <Loading text={t('pages.logout.loading')} />;
};

export default LogoutPage;
