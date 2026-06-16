import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import { _AUTH_LOGIN_PATH, PARAM_NAME_RETURN_URL } from '@/core/auth/authentication/constants/authentication.constants';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import usePasskeyScript from '@/core/auth/authentication/hooks/usePasskeyScript';
import type { LocationStateWithKratosErrors } from '@/core/auth/authentication/pages/LocationStateWithKratosErrors';
import { useReturnUrl } from '@/core/auth/authentication/utils/useSignUpReturnUrl';
import { NotAuthenticatedRoute } from '@/core/routing/NotAuthenticatedRoute';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { GuestReturnNotice } from '@/crd/components/auth/GuestReturnNotice';
import { SignUpCard } from '@/crd/components/auth/SignUpCard';
import { cn } from '@/crd/lib/utils';
import { useGuestSessionReturn } from '@/domain/collaboration/whiteboard/guestAccess/hooks/useGuestSessionReturn';
import { useConfig } from '@/domain/platform/config/useConfig';
import { buildLoginUrl } from '@/main/routing/urlBuilders';
import { AuthShellWrapper } from './AuthShellWrapper';
import { CrdEmailVerificationRequiredPage } from './CrdEmailVerificationRequiredPage';
import { flowDescriptorAdapter } from './flowDescriptorAdapter';
import { invokePasskeyTrigger } from './passkeyTrigger';
import { useTranslateDescriptor } from './useKratosMessageCopy';

// Kratos returns this when registration is attempted with an email that already
// has an account (e.g. one created via a social/OIDC login). Mirroring the MUI
// `RegistrationPage`, we bounce the user to the login page — where they can sign
// in with the existing method or reset their password — instead of stranding
// them on a registration form they can never complete.
const MESSAGE_CODE_ACCOUNT_EXIST_FOR_ID = 4000007;

/**
 * Shared sign-up page logic. Drives the Kratos registration flow and persists
 * the accept-terms checkbox per flow id, because Kratos resets that trait on a
 * validation-error re-render (mirrors the MUI `RegistrationPage` workaround).
 */
function CrdSignUpPage() {
  useTransactionScope({ type: 'authentication' });
  const { t } = useTranslation();
  usePageTitle(t('pages.titles.signUp'));

  const params = useQueryParams();
  const flowId = params.get('flow') || undefined;
  const { flow: registrationFlow, loading } = useKratosFlow(FlowTypeName.Registration, flowId);
  const { locations } = useConfig();

  // Persist the returnUrl to the cookie that `LoginSuccessPage` reads, so a user who
  // arrives at `/sign_up?returnUrl=…` (or `/registration?returnUrl=…`) is sent back to
  // that URL after registering + verifying (parity with MUI `SignUp`). The cookie
  // survives the email-verification round-trip, even across a new tab.
  const returnUrl = params.get(PARAM_NAME_RETURN_URL);
  const { setReturnUrl } = useReturnUrl();
  useEffect(() => {
    setReturnUrl(returnUrl);
  }, [returnUrl]);

  const translateDescriptor = useTranslateDescriptor();
  usePasskeyScript(registrationFlow?.ui?.nodes);

  const [accepted, setAccepted] = useState(false);
  const storageKey = registrationFlow ? `crd-auth-accepted-terms-${registrationFlow.id}` : undefined;

  useEffect(() => {
    if (storageKey) {
      setAccepted(sessionStorage.getItem(storageKey) === 'true');
    }
  }, [storageKey]);

  const handleAcceptedChange = (value: boolean) => {
    setAccepted(value);
    if (storageKey) {
      sessionStorage.setItem(storageKey, String(value));
    }
  };

  const baseDescriptor = registrationFlow ? flowDescriptorAdapter(registrationFlow, 'registration') : undefined;
  const descriptor = baseDescriptor ? translateDescriptor(baseDescriptor) : undefined;

  // A guest who left a public whiteboard lands here; surface the return notice
  // above the sign-up form when an active guest session is detected. The session
  // read and navigation handlers live in the existing domain hook.
  const { shouldShowNotification, handleBackToWhiteboard, handleGoToWebsite } = useGuestSessionReturn();

  // Account already exists for this email → redirect to login, carrying the
  // Kratos messages so the login page can show the "this email is already
  // associated with an account" notice (parity with MUI `RegistrationPage`).
  if (registrationFlow?.ui.messages?.some(message => message.id === MESSAGE_CODE_ACCOUNT_EXIST_FOR_ID)) {
    const state: LocationStateWithKratosErrors = { kratosErrors: registrationFlow.ui.messages };
    return <Navigate to={_AUTH_LOGIN_PATH} state={state} replace={true} />;
  }

  return (
    <AuthShellWrapper wide={shouldShowNotification}>
      {/* Single column on mobile/tablet; when the guest notice shows, lay the
          notice and the sign-up card out as two columns from `lg` up. The shell
          only widens its slot when `wide` is set, so the no-notice case and every
          other auth screen are unchanged. */}
      <div className={cn('flex flex-col gap-6', shouldShowNotification && 'lg:flex-row lg:items-center')}>
        {shouldShowNotification && (
          <GuestReturnNotice
            onBackToWhiteboard={handleBackToWhiteboard}
            onGoToWebsite={handleGoToWebsite}
            className="lg:flex-1 lg:basis-0"
          />
        )}
        <div className={cn(shouldShowNotification && 'lg:flex-1 lg:basis-0')}>
          <SignUpCard
            descriptor={descriptor}
            isLoading={loading}
            signInHref={buildLoginUrl()}
            termsOfUseHref={locations?.terms ?? '#'}
            privacyPolicyHref={locations?.privacy ?? '#'}
            hasAcceptedTerms={accepted}
            onAcceptedTermsChange={handleAcceptedChange}
            onPasskeyTrigger={trigger => {
              invokePasskeyTrigger(trigger).catch(() => {
                /* passkey errors are surfaced inline once passkey is wired for registration */
              });
            }}
          />
        </div>
      </div>
    </AuthShellWrapper>
  );
}

/** CRD `/sign_up` route — the curated quick-registration entry point. */
export function SignUpCrdRoute() {
  return <CrdSignUpPage />;
}

/** CRD `/registration` route — the full Kratos registration flow + success handler. */
export function RegistrationCrdRoute() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <NotAuthenticatedRoute>
            <CrdSignUpPage />
          </NotAuthenticatedRoute>
        }
      />
      <Route path="success" element={<CrdEmailVerificationRequiredPage pageTitleKey="pages.titles.signUp" />} />
    </Routes>
  );
}
