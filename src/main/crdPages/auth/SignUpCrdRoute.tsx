import type { RegistrationFlow } from '@ory/kratos-client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import { isInputNode, isSubmitButton } from '@/core/auth/authentication/components/Kratos/helpers';
import { _AUTH_LOGIN_PATH, PARAM_NAME_RETURN_URL } from '@/core/auth/authentication/constants/authentication.constants';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import usePasskeyScript from '@/core/auth/authentication/hooks/usePasskeyScript';
import type { LocationStateWithKratosErrors } from '@/core/auth/authentication/pages/LocationStateWithKratosErrors';
import { useReturnUrl, useSignUpRoundTrip } from '@/core/auth/authentication/utils/useSignUpReturnUrl';
import { NotAuthenticatedRoute } from '@/core/routing/NotAuthenticatedRoute';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { GuestReturnNotice } from '@/crd/components/auth/GuestReturnNotice';
import { SignUpCard } from '@/crd/components/auth/SignUpCard';
import { cn } from '@/crd/lib/utils';
import { useGuestSessionReturn } from '@/domain/collaboration/whiteboard/guestAccess/hooks/useGuestSessionReturn';
import { markSignupInitiated } from '@/domain/language/useAnonymousLanguageCarry';
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

// A person who presses a provider button believing they are signing in, but
// whose provider identity Kratos does not yet recognise, is bounced into this
// same registration flow rather than told to sign up. Kratos stamps the
// active strategy on a flow continued from an OIDC callback; a person who
// chose to register directly gets a fresh flow with no active method. This
// is the discriminator the sign-up signpost (FR-013/014) branches on.
// Fallback: a fresh browser registration flow never carries `oidc` group
// input (non-submit) nodes — those only appear once an OIDC continuation has
// pre-filled provider-supplied traits — so their presence is equivalent
// evidence if `active` is ever unset for this arrival.
const isProviderArrivalFlow = (flow: RegistrationFlow | undefined): boolean => {
  if (!flow) return false;
  if (flow.active === 'oidc') return true;
  const nodes = flow.ui?.nodes ?? [];
  return nodes.some(node => node.group === 'oidc' && isInputNode(node) && !isSubmitButton(node));
};

type CrdSignUpPageProps = {
  /**
   * `/sign_up` and `/registration` can resolve to the very same Kratos flow
   * id (Kratos bounces a validation error on a later field back to
   * `/registration?flow=<id>`). When that happens, this step's mount
   * re-hydrates `accepted` as `true` from sessionStorage — which is exactly
   * the point of persisting it across the re-render — but the checkbox
   * itself is still a plain toggle, so a stray second click on what is
   * already checked just unchecks it (ordinary checkbox semantics), silently
   * disabling submit with no visible error. Passing `true` here makes
   * further toggling a no-op once the *initial* hydration for this mount
   * found terms already accepted — it never locks a value the user sets
   * during the current mount, only one carried over from a prior step. The
   * checkbox stays a normal, non-`disabled` form field throughout (so its
   * `checked` value keeps posting to Kratos with the rest of the form).
   */
  lockAcceptedTerms?: boolean;
};

/**
 * Shared sign-up page logic. Drives the Kratos registration flow and persists
 * the accept-terms checkbox per flow id, because Kratos resets that trait on a
 * validation-error re-render (mirrors the MUI `RegistrationPage` workaround).
 */
function CrdSignUpPage({ lockAcceptedTerms }: CrdSignUpPageProps) {
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
  const { returnUrl: storedReturnUrl, setReturnUrl } = useReturnUrl();
  const { arm } = useSignUpRoundTrip();
  useEffect(() => {
    setReturnUrl(returnUrl);
    // Set the signup-initiated marker so that useAnonymousLanguageCarry can
    // distinguish a fresh signup from a kiosk sign-in (DL-11 / R-4).
    markSignupInitiated();
    if (returnUrl) {
      // Arm here rather than on `/registration/success`: this page is guaranteed
      // to render, whereas that one is reached only if Kratos is configured to
      // redirect there. `useSignUpReturnRedirect` disarms on first consumption.
      arm();
    }
  }, [returnUrl]);

  const translateDescriptor = useTranslateDescriptor();
  usePasskeyScript(registrationFlow?.ui?.nodes);

  const [accepted, setAccepted] = useState(false);
  // Set once, from this mount's initial sessionStorage hydration only — never
  // touched by `handleAcceptedChange` — so it captures "was already accepted
  // before this step loaded" as distinct from "the user just ticked it here".
  const [wasPreAccepted, setWasPreAccepted] = useState(false);
  const storageKey = registrationFlow ? `crd-auth-accepted-terms-${registrationFlow.id}` : undefined;

  useEffect(() => {
    if (storageKey) {
      const stored = sessionStorage.getItem(storageKey) === 'true';
      setAccepted(stored);
      setWasPreAccepted(stored);
    }
  }, [storageKey]);

  // Once this step's own mount found terms already accepted (carried over
  // from an earlier step of the same Kratos flow), further checkbox
  // interaction is a no-op — see `lockAcceptedTerms` above.
  const acceptedTermsLocked = Boolean(lockAcceptedTerms && wasPreAccepted);

  const handleAcceptedChange = (value: boolean) => {
    if (acceptedTermsLocked) {
      return;
    }
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
            showSignpost={isProviderArrivalFlow(registrationFlow)}
            signInHref={
              // Carry the destination into the sign-in link so a user who
              // switches from sign-up to sign-in keeps it.
              buildLoginUrl(returnUrl ?? storedReturnUrl)
            }
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
            {/* Reached from `/sign_up` on the same Kratos flow id (e.g. after a
                validation error on a later field) — lock the checkbox once it
                re-hydrates as already accepted, instead of leaving it a live
                toggle a stray click can silently uncheck (see `lockAcceptedTerms`). */}
            <CrdSignUpPage lockAcceptedTerms={true} />
          </NotAuthenticatedRoute>
        }
      />
      <Route path="success" element={<CrdEmailVerificationRequiredPage pageTitleKey="pages.titles.signUp" />} />
    </Routes>
  );
}
