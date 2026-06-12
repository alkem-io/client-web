import type { TFunction } from 'i18next';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import {
  AUTH_REMINDER_PATH,
  AUTH_RESET_PASSWORD_PATH,
  AUTH_SIGN_UP_PATH,
  OIDC_LOGIN_PATH,
  PARAM_NAME_RETURN_URL,
  STORAGE_KEY_RETURN_URL,
} from '@/core/auth/authentication/constants/authentication.constants';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import usePasskeyScript from '@/core/auth/authentication/hooks/usePasskeyScript';
import type { LocationStateWithKratosErrors } from '@/core/auth/authentication/pages/LocationStateWithKratosErrors';
import LoginSuccessPage from '@/core/auth/authentication/pages/LoginSuccessPage';
import { useReturnUrl } from '@/core/auth/authentication/utils/useSignUpReturnUrl';
import { NotAuthenticatedRoute } from '@/core/routing/NotAuthenticatedRoute';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useQueryParams } from '@/core/routing/useQueryParams';
import type { KratosFlowDescriptor, KratosMessage } from '@/crd/components/auth/flowDescriptor';
import { LoginCard } from '@/crd/components/auth/LoginCard';
import usePlatformOrigin from '@/domain/platform/routes/usePlatformOrigin';
import { AuthShellWrapper } from './AuthShellWrapper';
import { flowDescriptorAdapter } from './flowDescriptorAdapter';
import { invokePasskeyTrigger, PasskeyTriggerError } from './passkeyTrigger';
import { useKratosMessageCopy, useTranslateDescriptor } from './useKratosMessageCopy';

const EMAIL_NOT_VERIFIED_MESSAGE_ID = 4000010;
// Client-side message id for account lockout (HTTP 429). Mirrors `LoginPage.tsx`.
const ACCOUNT_LOCKOUT_MESSAGE_ID = 9000429;
// Client-side message id for a passkey ceremony failure.
const PASSKEY_ERROR_MESSAGE_ID = -1;

function CrdLoginPage({ flow }: { flow?: string }) {
  useTransactionScope({ type: 'authentication' });
  const { t } = useTranslation();
  usePageTitle(t('pages.titles.signIn'));

  const navigate = useNavigate();
  const { flow: loginFlow, loading } = useKratosFlow(FlowTypeName.Login, flow);
  const { kratosErrors } = (useLocation().state as LocationStateWithKratosErrors | null) ?? {};
  const params = useQueryParams();
  const [passkeyError, setPasskeyError] = useState<string>();
  const translateDescriptor = useTranslateDescriptor();
  const translateMessages = useKratosMessageCopy();

  // OIDC BFF entry (parity with the MUI `LoginPage`): when this page is reached
  // without a Kratos flow id the user is starting a fresh sign-in — hand off to
  // alkemio-server's OIDC login route so the request goes Hydra → consent →
  // `/api/auth/oidc/callback`, which mints the `alkemio_session` BFF cookie.
  // Rendering the Kratos form here instead would complete a standalone Kratos
  // login that bypasses Hydra, leaving the server unable to see the user.
  // When Kratos bounces back with `?flow=<id>` during the Hydra-initiated flow,
  // render the form as normal (the flow id is opaque state Kratos owns).
  const returnUrlFromParam = params.get(PARAM_NAME_RETURN_URL) ?? undefined;
  const { returnUrl: storedReturnUrl, setReturnUrl } = useReturnUrl();
  const platformOrigin = usePlatformOrigin();
  const isOidcEntry = !flow;

  useLayoutEffect(() => {
    if (!isOidcEntry) return;
    if (returnUrlFromParam) {
      setReturnUrl(returnUrlFromParam);
    }
    const raw = returnUrlFromParam ?? storedReturnUrl ?? '/';
    // FR-017a — server-side validator requires a same-origin path-only value.
    const returnTo = (() => {
      try {
        const u = new URL(raw, window.location.origin);
        return u.origin === window.location.origin ? `${u.pathname}${u.search}${u.hash}` || '/' : '/';
      } catch {
        return raw.startsWith('/') ? raw : '/';
      }
    })();
    // The OIDC BFF (/api/auth/oidc/*) is apex-only and called same-origin-relative.
    // This page also renders on the identity subdomain (its sign-up/recovery pages
    // link back to /login); a relative replace there would land on
    // identity.<domain>/api/auth/oidc/login, which is unrouted (Traefik sends it to
    // the SPA catch-all → no OIDC flow). Always hand off to the apex origin
    // absolutely. platformOrigin is the apex (`https://<locations.domain>`); falls
    // back to relative when unknown (single-host dev). Mirrors `LoginPage`.
    const base = platformOrigin ?? '';
    window.location.replace(`${base}${OIDC_LOGIN_PATH}?returnTo=${encodeURIComponent(returnTo)}`);
  }, [isOidcEntry, returnUrlFromParam, platformOrigin]);

  usePasskeyScript(loginFlow?.ui?.nodes);

  const isLockedOut = params.get('lockout') === 'true';
  const retryAfterRaw = Number(params.get('retry_after'));
  const retryAfterSeconds = Number.isFinite(retryAfterRaw) ? Math.max(0, retryAfterRaw) : 0;
  const lockoutMinutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));

  // Email-not-verified → redirect to the verification reminder (parity with LoginPage).
  useEffect(() => {
    const messages = loginFlow?.ui?.messages ?? [];
    if (messages.some(message => message.id === EMAIL_NOT_VERIFIED_MESSAGE_ID)) {
      navigate(AUTH_REMINDER_PATH);
    }
  }, [loginFlow, navigate]);

  const descriptor = ((): KratosFlowDescriptor | undefined => {
    if (!loginFlow) {
      return undefined;
    }
    const base = translateDescriptor(flowDescriptorAdapter(loginFlow, 'login'));
    // Redirected-in errors (e.g. the "account already exists" notice forwarded
    // from the registration flow) arrive as raw Kratos text — run them through
    // the same copy overrides as inline flow messages so the user sees Alkemio's
    // wording, matching the MUI `LoginPage` → `KratosMessages` path.
    let messages: KratosMessage[] = kratosErrors
      ? translateMessages(
          kratosErrors.map(error => ({
            id: error.id,
            type: error.type as KratosMessage['type'],
            text: error.text,
            context: error.context as Record<string, unknown> | undefined,
          }))
        )
      : base.messages;
    if (isLockedOut) {
      messages = [
        ...messages,
        {
          id: ACCOUNT_LOCKOUT_MESSAGE_ID,
          type: 'error',
          text: t('authentication.lockout', { minutes: lockoutMinutes }),
        },
      ];
    }
    if (passkeyError) {
      messages = [...messages, { id: PASSKEY_ERROR_MESSAGE_ID, type: 'error', text: passkeyError }];
    }
    return { ...base, messages };
  })();

  // OIDC entry: a full-page redirect to the BFF login route is in flight (see
  // the useLayoutEffect above). Show the card in its loading state rather than
  // the interactive Kratos form so the user can't complete a bypassing login.
  if (isOidcEntry) {
    return (
      <AuthShellWrapper>
        <LoginCard
          descriptor={undefined}
          isLoading={true}
          signUpHref={AUTH_SIGN_UP_PATH}
          forgotPasswordHref={AUTH_RESET_PASSWORD_PATH}
        />
      </AuthShellWrapper>
    );
  }

  return (
    <AuthShellWrapper>
      <LoginCard
        descriptor={descriptor}
        isLoading={loading}
        signUpHref={AUTH_SIGN_UP_PATH}
        forgotPasswordHref={AUTH_RESET_PASSWORD_PATH}
        onPasskeyTrigger={trigger => {
          setPasskeyError(undefined);
          invokePasskeyTrigger(trigger).catch(error => {
            setPasskeyError(translatePasskeyError(t, error));
          });
        }}
      />
    </AuthShellWrapper>
  );
}

/** Maps a passkey-trigger failure to its localised user-facing message. Falls
 *  back to the existing `authentication.passkey.unknown-error` copy for any
 *  shape we don't recognise (e.g. a non-PasskeyTriggerError thrown). */
function translatePasskeyError(t: TFunction, error: unknown): string {
  if (error instanceof PasskeyTriggerError) {
    if (error.reason === 'not-supported') return t('authentication.passkey.not-supported');
    if (error.reason === 'script-not-loaded') return t('authentication.passkey.script-loading');
  }
  return t('authentication.passkey.unknown-error');
}

/**
 * CRD login route — the replacement for the MUI `LoginRoute`.
 * Mirrors its structure: the login screen at `/` and the post-login
 * success handler at `/success`.
 *
 * A Kratos-initiated login arrives here with a `flow` id in the URL. This
 * includes *refresh* (re-authentication) logins, which Kratos demands before
 * privileged Settings changes — adding a passkey, changing the password —
 * once the session is older than `privileged_session_max_age`. In that case
 * the user already holds a (non-privileged) session, so the usual
 * `NotAuthenticatedRoute` guard would bounce them to the dashboard and the
 * re-auth form would never render, silently aborting the Settings change.
 * Whenever a flow id is present we render the login page regardless of
 * authentication state so the flow (incl. refresh / step-up) can complete.
 */
export function LoginCrdRoute() {
  const params = useQueryParams();
  const flow = params.get('flow') || undefined;
  const returnUrl = params.get(PARAM_NAME_RETURN_URL);
  const { setReturnUrl } = useReturnUrl();

  useEffect(() => {
    if (returnUrl) {
      // The cookie is what `LoginSuccessPage` reads back via `useGetReturnUrl()`;
      // the sessionStorage write is retained for the guest-whiteboard return flow.
      setReturnUrl(returnUrl);
      sessionStorage.setItem(STORAGE_KEY_RETURN_URL, returnUrl);
    }
  }, [returnUrl]);

  const loginPage = <CrdLoginPage flow={flow} />;

  return (
    <Routes>
      <Route path="/" element={flow ? loginPage : <NotAuthenticatedRoute>{loginPage}</NotAuthenticatedRoute>} />
      <Route path="success" element={<LoginSuccessPage />} />
    </Routes>
  );
}
