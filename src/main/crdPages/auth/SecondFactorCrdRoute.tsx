import { useTranslation } from 'react-i18next';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import { isAppMode } from '@/core/appMode/isAppMode';
import { AUTH_LOGOUT_PATH } from '@/core/auth/authentication/constants/authentication.constants';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import usePasskeyScript from '@/core/auth/authentication/hooks/usePasskeyScript';
import { SECOND_FACTOR_PATH } from '@/core/auth/authentication/routeToSecondFactor';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useQueryParams } from '@/core/routing/useQueryParams';
import {
  SecondFactorRequiredCard,
  type SecondFactorRequiredState,
} from '@/crd/components/auth/SecondFactorRequiredCard';
import usePlatformOrigin from '@/domain/platform/routes/usePlatformOrigin';
import { AuthShellWrapper } from './AuthShellWrapper';
import { TwoStepVerification } from './TwoStepVerification';
import { adaptTwoStepVerification } from './twoStepVerificationModel';

/**
 * `/second-factor` — where a session refused for a missing second factor is
 * sent. Built on the Kratos settings flow alone: the server answers this
 * session's GraphQL with the refusal, so the page issues none. Whether the
 * person has enrolled is read from the flow; once they have, signing in again
 * (now with the second factor) ends the refusal.
 */
export function SecondFactorCrdRoute() {
  useTransactionScope({ type: 'authentication' });
  const { t } = useTranslation('crd-auth');
  usePageTitle(t('secondFactorPage.title'));
  const platformOrigin = usePlatformOrigin();
  // Signing in again goes through the logout: a sign-in on the live identity-provider session would
  // complete silently and never ask for the second step.
  const actions = {
    signInAgainHref: AUTH_LOGOUT_PATH,
    signOutHref: AUTH_LOGOUT_PATH,
  };

  // Enrolling in the app shell is not supported: the person is told to do it on the web first.
  if (isAppMode()) {
    return (
      <AuthShellWrapper>
        <SecondFactorRequiredCard state="app" {...actions} />
      </AuthShellWrapper>
    );
  }

  return <SecondFactorEnrolment platformOrigin={platformOrigin} actions={actions} />;
}

function SecondFactorEnrolment({
  platformOrigin,
  actions,
}: {
  platformOrigin: string | undefined;
  actions: { signInAgainHref: string; signOutHref: string };
}) {
  const params = useQueryParams();
  const flowId = params.get('flow') || undefined;
  // A wrong code or a password re-confirmation returns through Kratos's settings page, which hands
  // the browser back here with `?flow=` (see settingsFlowSecurityReturn).
  const { flow, loading, error } = useKratosFlow(FlowTypeName.Settings, flowId, {
    returnTo: `${platformOrigin ?? window.location.origin}${SECOND_FACTOR_PATH}`,
  });
  usePasskeyScript(flow?.ui?.nodes);

  const state: SecondFactorRequiredState = loading
    ? 'loading'
    : !flow || error
      ? 'unavailable'
      : adaptTwoStepVerification(flow).enrolled
        ? 'enrolled'
        : 'enrol';

  return (
    <AuthShellWrapper wide={state === 'enrol'}>
      <SecondFactorRequiredCard
        state={state}
        enrolment={flow ? <TwoStepVerification flow={flow} /> : null}
        {...actions}
      />
    </AuthShellWrapper>
  );
}
