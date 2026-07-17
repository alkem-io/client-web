import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUnsubscribeFromPushNotificationsMutation } from '@/core/apollo/generated/apollo-hooks';
import { useLogoutUrl } from '@/core/auth/authentication/hooks/useLogoutUrl';
import { useReturnUrl, useSignUpRoundTrip } from '@/core/auth/authentication/utils/useSignUpReturnUrl';
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
      // getRegistration() resolves immediately (undefined when no SW), unlike
      // navigator.serviceWorker.ready, which NEVER resolves without an active
      // service worker — the SW only registers in PROD builds, so awaiting
      // `.ready` hung the logout redirect forever on dev stacks (and would in
      // prod for any user whose SW failed to activate).
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
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

  const { getLogoutUrl, outcome } = useLogoutUrl();
  const { clearReturnUrl } = useReturnUrl();
  const { clearArmed } = useSignUpRoundTrip();
  const [unsubscribeMutation] = useUnsubscribeFromPushNotificationsMutation();

  useEffect(() => {
    if (!outcome) {
      getLogoutUrl();
      return;
    }
    if (outcome.kind === 'redirect') {
      // Wait for push cleanup before redirecting to avoid leaving stale subscriptions.
      // The target is whichever logout leg useLogoutUrl picked next — the Hydra
      // end_session URL or the Kratos SSO logout URL.
      cleanupPushSubscription(unsubscribeMutation).finally(() => {
        clearReturnUrl();
        clearArmed();
        window.location.replace(outcome.url);
      });
      return;
    }
    // outcome.kind === 'cleared' — nothing left to end (no BFF session, no Kratos
    // session). Land on the public home page instead of the bare placeholder.
    cleanupPushSubscription(unsubscribeMutation).finally(() => {
      clearReturnUrl();
      clearArmed();
      window.location.replace('/home');
    });
  }, [outcome]);

  return <Loading text={t('pages.logout.loading')} />;
};

export default LogoutPage;
