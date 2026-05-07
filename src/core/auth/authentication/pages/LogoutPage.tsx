import { Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUnsubscribeFromPushNotificationsMutation } from '@/core/apollo/generated/apollo-hooks';
import { useLogoutUrl } from '@/core/auth/authentication/hooks/useLogoutUrl';
import { useReturnUrl } from '@/core/auth/authentication/utils/useSignUpReturnUrl';
import Loading from '@/core/ui/loading/Loading';
import { PUSH_SUBSCRIPTION_ID_KEY, PUSH_USER_DISABLED_KEY } from '@/main/pushNotifications/constants';

async function cleanupPushSubscription(
  unsubscribeMutation: ReturnType<typeof useUnsubscribeFromPushNotificationsMutation>[0]
) {
  try {
    const subscriptionId = localStorage.getItem(PUSH_SUBSCRIPTION_ID_KEY);

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
    // Always clear cached state, even if cleanup partially fails
    localStorage.removeItem(PUSH_SUBSCRIPTION_ID_KEY);
    localStorage.removeItem(PUSH_USER_DISABLED_KEY);
  }
}

const LogoutPage = () => {
  const { t } = useTranslation();

  const { getLogoutUrl, outcome, error } = useLogoutUrl();
  const { clearReturnUrl } = useReturnUrl();
  const [unsubscribeMutation] = useUnsubscribeFromPushNotificationsMutation();

  useEffect(() => {
    if (!outcome) {
      getLogoutUrl();
      return;
    }
    if (outcome.kind === 'redirect') {
      // Wait for push cleanup before redirecting to avoid leaving stale subscriptions
      cleanupPushSubscription(unsubscribeMutation).finally(() => {
        clearReturnUrl();
        window.location.replace(outcome.url);
      });
      return;
    }
    // outcome.kind === 'cleared' — already logged out. Tidy up local state,
    // then redirect to the public home page so the user lands on a real
    // anonymous view instead of the bare "logged out" placeholder.
    cleanupPushSubscription(unsubscribeMutation).finally(() => {
      clearReturnUrl();
      window.location.replace('/home');
    });
  }, [outcome]);

  if (error) return <Typography>{String(error)}</Typography>;
  return <Loading text={t('pages.logout.loading')} />;
};

export default LogoutPage;
