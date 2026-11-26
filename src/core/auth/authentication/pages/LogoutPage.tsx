import { useApolloClient } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isInvalidSession } from '@/core/apollo/v2/isSessionStoreUnavailable';
import { useRetireV2ForNavigation } from '@/core/apollo/v2/V2ApolloProvider';
import {
  OIDC_RECOVERY_ATTEMPTED_KEY,
  STORAGE_KEY_RETURN_URL,
} from '@/core/auth/authentication/constants/authentication.constants';
import { useLogoutUrl } from '@/core/auth/authentication/hooks/useLogoutUrl';
import { useReturnUrl, useSignUpRoundTrip } from '@/core/auth/authentication/utils/useSignUpReturnUrl';
import { useNativeFoundation } from '@/core/foundation/NativeFoundationProvider';
import { runMatrixLogoutCleanup } from '@/core/matrix/logoutCleanup';
import Loading from '@/core/ui/loading/Loading';
import { AuthCard } from '@/crd/components/auth/AuthCard';
import { Button } from '@/crd/primitives/button';
import { ROUTE_HOME } from '@/domain/platform/routes/constants';
import { AuthShellWrapper } from '@/main/crdPages/auth/AuthShellWrapper';
import {
  DEVICE_PUSH_TOKEN_KEY,
  PUSH_SUBSCRIPTION_ID_KEY,
  PUSH_USER_DISABLED_KEY,
} from '@/main/pushNotifications/constants';
import { clearMessagingDrafts } from '@/main/userMessaging/messagingDrafts';

async function cleanupPushSubscription(): Promise<boolean> {
  try {
    const nativeBinding = localStorage.getItem(DEVICE_PUSH_TOKEN_KEY) !== null;
    let browserBinding = localStorage.getItem(PUSH_SUBSCRIPTION_ID_KEY) !== null;
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (!subscription || (await subscription.unsubscribe())) {
        localStorage.removeItem(PUSH_SUBSCRIPTION_ID_KEY);
        localStorage.removeItem(PUSH_USER_DISABLED_KEY);
        browserBinding = false;
      } else {
        browserBinding = true;
      }
    }
    return nativeBinding || browserBinding;
  } catch {
    return true;
  }
}

const LogoutPage = () => {
  const { t } = useTranslation();
  const foundation = useNativeFoundation();
  const client = useApolloClient();
  const retireForNavigation = useRetireV2ForNavigation();
  const { getLogoutUrl, outcome, error } = useLogoutUrl();
  const { clearReturnUrl } = useReturnUrl();
  const { clearArmed } = useSignUpRoundTrip();
  const [starting, setStarting] = useState(true);
  const [cleanup, setCleanup] = useState({ local: false, push: false });
  const started = useRef(false);
  const invalidSession = isInvalidSession(foundation.error);
  const foundationUnavailable = !invalidSession && (foundation.error || (!foundation.loading && !foundation.data));

  const begin = async () => {
    const session = invalidSession ? 'invalid-session' : foundation.data?.viewer.session.authenticated;
    if (foundation.loading || foundationUnavailable || session === undefined) return;
    setStarting(true);
    const local = await Promise.allSettled([
      client.clearStore(),
      runMatrixLogoutCleanup(),
      Promise.resolve().then(() => {
        clearReturnUrl();
        clearArmed();
        clearMessagingDrafts();
        sessionStorage.removeItem(STORAGE_KEY_RETURN_URL);
        sessionStorage.removeItem(OIDC_RECOVERY_ATTEMPTED_KEY);
      }),
    ]);
    const push = await cleanupPushSubscription();
    const localIncomplete = local.some(result => result.status === 'rejected');
    setCleanup({ local: localIncomplete, push });
    const next = await getLogoutUrl(session);
    setStarting(false);
    const destination =
      next?.kind === 'redirect'
        ? next.url
        : next?.kind === 'cleared' && !localIncomplete && !push
          ? ROUTE_HOME
          : undefined;
    if (destination) {
      await Promise.allSettled([retireForNavigation()]);
      window.location.replace(destination);
    }
  };

  useEffect(() => {
    if (started.current || foundation.loading || foundationUnavailable || (!invalidSession && !foundation.data)) return;
    started.current = true;
    void begin();
  }, [begin, foundation.loading, foundationUnavailable, invalidSession, foundation.data]);

  return (
    <AuthShellWrapper>
      {foundationUnavailable ||
      (!starting &&
        (error || outcome?.kind === 'unknown' || (outcome?.kind === 'cleared' && (cleanup.local || cleanup.push)))) ? (
        <AuthCard title={t('pages.logout.loading')}>
          <p role="alert">
            {t(
              outcome?.kind === 'unknown'
                ? 'pages.logout.unknown'
                : foundationUnavailable || error
                  ? 'pages.logout.unavailable'
                  : cleanup.push
                    ? 'pages.logout.pushCleanupUnavailable'
                    : 'pages.logout.cleanupUnavailable'
            )}
          </p>
          {outcome?.kind !== 'unknown' && (
            <Button
              onClick={() => {
                if (foundationUnavailable) {
                  started.current = false;
                  void foundation.refetch().catch(() => undefined);
                } else {
                  void begin();
                }
              }}
            >
              {t('apollo.errors.network.retry')}
            </Button>
          )}
        </AuthCard>
      ) : (
        <Loading text={t('pages.logout.loading')} />
      )}
    </AuthShellWrapper>
  );
};

export default LogoutPage;
