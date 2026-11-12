import type { LoginFlow } from '@ory/kratos-client';
import { formatDuration } from 'date-fns';
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
import { useAuthenticationContext } from '@/core/auth/authentication/hooks/useAuthenticationContext';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import usePasskeyScript from '@/core/auth/authentication/hooks/usePasskeyScript';
import type { LocationStateWithKratosErrors } from '@/core/auth/authentication/pages/LocationStateWithKratosErrors';
import LoginSuccessPage from '@/core/auth/authentication/pages/LoginSuccessPage';
import { useReturnUrl } from '@/core/auth/authentication/utils/useSignUpReturnUrl';
import { NotAuthenticatedRoute } from '@/core/routing/NotAuthenticatedRoute';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { resolveInternalReturnPath } from '@/core/utils/links';
import { AppSignInWelcome } from '@/crd/components/auth/AppSignInWelcome';
import {
  emptySecondFactorGroup,
  type KratosFlowDescriptor,
  type KratosMessage,
} from '@/crd/components/auth/flowDescriptor';
import { LoginCard, type LoginCardNotice } from '@/crd/components/auth/LoginCard';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import usePlatformOrigin from '@/domain/platform/routes/usePlatformOrigin';
import { buildSignUpUrl, URL_SPACE_EXPLORER } from '@/main/routing/urlBuilders';
import { AuthShellWrapper } from './AuthShellWrapper';
import { flowDescriptorAdapter } from './flowDescriptorAdapter';
import { invokePasskeyTrigger, translatePasskeyError } from './passkeyTrigger';
import { useKratosMessageCopy, useTranslateDescriptor } from './useKratosMessageCopy';

const EMAIL_NOT_VERIFIED_MESSAGE_ID = 4000010;
// Client-side message id for account lockout (HTTP 429). Mirrors `LoginPage.tsx`.
const ACCOUNT_LOCKOUT_MESSAGE_ID = 9000429;
// Client-side message id for a passkey ceremony failure.
const PASSKEY_ERROR_MESSAGE_ID = -1;

// The closed set of `?app_signin=` reasons the native shell and the server's
// /app-handoff route emit (FR-012). Written as quoted literals on purpose: this
// is the consumer half of the cross-repo `app-signin-landing-params` contract.
// Any other value is ignored, so a crafted link falls through to the ordinary
// OIDC entry rather than parking the visitor on a card with no way forward.
const APP_SIGN_IN_VALUES = ['required', 'cancelled', 'failed'] as const;

/** The recognised `?app_signin=` reason, or undefined for absent/unrecognised.
 *  Read twice — once by the route to exempt the arrival from the
 *  `NotAuthenticatedRoute` guard, once by the page to render the notice. */
function readAppSignIn(params: URLSearchParams) {
  return APP_SIGN_IN_VALUES.find(value => value === params.get('app_signin'));
}

/**
 * Absolute URL that restarts sign-in at the OIDC BFF, preserving the pending
 * destination.
 *
 * FR-017a — the server-side validator requires a same-origin, path-only
 * `returnTo`. Resolve it against the apex rather than `window.location.origin`:
 * this page also renders on the identity subdomain (its sign-up / recovery
 * pages link back to /login), where an apex-absolute returnUrl would be judged
 * cross-origin and collapse to '/', dropping the destination on every deployed
 * sign-up.
 *
 * The BFF (/api/auth/oidc/*) is apex-only, so the hand-off must be absolute: a
 * same-origin-relative one on the identity subdomain lands on
 * identity.<domain>/api/auth/oidc/login, which is unrouted (Traefik sends it to
 * the SPA catch-all → no OIDC flow). `platformOrigin` is the apex
 * (`https://<locations.domain>`) and falls back to relative when unknown
 * (single-host dev). Mirrors `LoginPage`.
 */
function buildOidcRestartHref(rawReturnUrl: string, platformOrigin: string | undefined) {
  const returnTo = resolveInternalReturnPath(rawReturnUrl, platformOrigin) ?? '/';
  return `${platformOrigin ?? ''}${OIDC_LOGIN_PATH}?returnTo=${encodeURIComponent(returnTo)}`;
}

/**
 * The identity provider confirms a stale session before a privileged settings
 * change with a refresh sign-in that asks the first factor alone, even when the
 * session holds a second factor — so the password by itself could remove the
 * second factor. For such a session the refresh is restarted with its return
 * pointed at a refresh of the second step, which then returns where the first
 * one was going (for a settings change, the identity provider's own
 * continuation of it). A refresh already returning into the second step is left
 * as it is.
 */
function refreshWithSecondStep(flow: LoginFlow, sessionAal: string | undefined): string | undefined {
  if (!flow.refresh || flow.requested_aal !== 'aal1' || sessionAal !== 'aal2') return undefined;
  const firstStep = new URL(flow.request_url);
  const returnTo = flow.return_to ?? firstStep.searchParams.get('return_to') ?? undefined;
  if (returnTo && new URL(returnTo, firstStep).searchParams.get('aal') === 'aal2') return undefined;
  const secondStep = new URL(firstStep.pathname, firstStep.origin);
  secondStep.searchParams.set('refresh', 'true');
  secondStep.searchParams.set('aal', 'aal2');
  if (returnTo) secondStep.searchParams.set('return_to', returnTo);
  firstStep.searchParams.set('return_to', secondStep.toString());
  return firstStep.toString();
}

function CrdLoginPage({ flow }: { flow?: string }) {
  useTransactionScope({ type: 'authentication' });
  const { t, i18n } = useTranslation();
  const { t: tAuth } = useTranslation('crd-auth');
  usePageTitle(t('pages.titles.signIn'));

  const navigate = useNavigate();
  const { flow: loginFlow, loading, error: loginFlowError } = useKratosFlow(FlowTypeName.Login, flow);
  const { kratosErrors } = (useLocation().state as LocationStateWithKratosErrors | null) ?? {};
  const params = useQueryParams();
  const [passkeyError, setPasskeyError] = useState<string>();
  const [showRecoveryCode, setShowRecoveryCode] = useState(false);
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
  const signUpReturnUrl = returnUrlFromParam ?? storedReturnUrl;
  const platformOrigin = usePlatformOrigin();
  // The login-backoff proxy (kratos-webhooks) 303s a locked-out browser to a
  // flow-less `/login?lockout=true&retry_after=N`. Treating that as a fresh
  // OIDC entry would immediately redirect away and discard the params before
  // the lockout notice can render — so a lockout arrival is NOT an OIDC entry;
  // it renders the notice with a manual way back into sign-in instead.
  const isLockedOutArrival = params.get('lockout') === 'true';
  // The native app shell intercepts credential surfaces and sends the visitor
  // back here with a reason; the server does the same when a hand-off fails.
  // Like a lockout arrival this is NOT an OIDC entry — redirecting would throw
  // the reason away before it could be read.
  const appSignIn = readAppSignIn(params);
  const isOidcEntry = !flow && !isLockedOutArrival && !appSignIn;

  useLayoutEffect(() => {
    if (!isOidcEntry) return;
    if (returnUrlFromParam) {
      setReturnUrl(returnUrlFromParam);
    }
    window.location.replace(buildOidcRestartHref(returnUrlFromParam ?? storedReturnUrl ?? '/', platformOrigin));
  }, [isOidcEntry, returnUrlFromParam, platformOrigin]);

  usePasskeyScript(loginFlow?.ui?.nodes);

  // A refresh is held on the loading card until the session's level is known, so
  // the first factor cannot be submitted before the restart below is decided.
  const { session, loading: sessionLoading } = useAuthenticationContext();
  const secondStepRefresh = loginFlow
    ? refreshWithSecondStep(loginFlow, session?.authenticator_assurance_level)
    : undefined;
  const isDecidingRefresh = Boolean(loginFlow?.refresh) && (sessionLoading || Boolean(secondStepRefresh));

  useLayoutEffect(() => {
    if (secondStepRefresh) window.location.replace(secondStepRefresh);
  }, [secondStepRefresh]);

  const isLockedOut = isLockedOutArrival;
  const retryAfterRaw = Number(params.get('retry_after'));
  const retryAfterSeconds = Number.isFinite(retryAfterRaw) ? Math.max(0, retryAfterRaw) : 0;
  // Human-readable remaining time ("2 minutes", "1 minute 50 seconds"),
  // localized by date-fns through the same locale mapping the rest of CRD uses.
  // Built from total minutes/seconds rather than `intervalToDuration`: that helper
  // carries whole hours in its own `hours` field, which this `format` list omits, so
  // a 3600s lockout formatted to the empty string and 3660s rendered as "1 minute".
  const lockoutTotalSeconds = Math.max(1, retryAfterSeconds);
  const lockoutDuration = formatDuration(
    { minutes: Math.floor(lockoutTotalSeconds / 60), seconds: lockoutTotalSeconds % 60 },
    {
      locale: resolveDateFnsLocale(i18n.language),
      format: ['minutes', 'seconds'],
    }
  );

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
          text: t('authentication.lockout', { duration: lockoutDuration }),
        },
      ];
    }
    if (passkeyError) {
      messages = [...messages, { id: PASSKEY_ERROR_MESSAGE_ID, type: 'error', text: passkeyError }];
    }
    return { ...base, messages };
  })();

  // The sign-in's second step: Kratos asks for a second factor (`requested_aal: aal2`). The code
  // and the recovery code are separate submits with a required field each, so only one of the two
  // is in the form at a time; the security key, when enrolled, is always offered beside it.
  const isSecondFactorStep = loginFlow?.requested_aal === 'aal2';
  const hasAuthenticatorCode = (descriptor?.groups.totp.inputs.length ?? 0) > 0;
  const hasRecoveryCode = (descriptor?.groups.lookupSecret.inputs.length ?? 0) > 0;
  const showingRecoveryCode = hasRecoveryCode && (showRecoveryCode || !hasAuthenticatorCode);
  const stepDescriptor =
    descriptor && isSecondFactorStep
      ? {
          ...descriptor,
          groups: {
            ...descriptor.groups,
            totp: showingRecoveryCode ? emptySecondFactorGroup() : descriptor.groups.totp,
            lookupSecret: showingRecoveryCode ? descriptor.groups.lookupSecret : emptySecondFactorGroup(),
          },
        }
      : descriptor;

  // The two arrivals that carry their reason in the query string: the backoff
  // proxy's lockout bounce, and the shell / server hand-off bounce. Neither may
  // render a Kratos form — the auto-provisioned flow is deliberately ignored,
  // both because a Kratos-native login would bypass Hydra and because the
  // backoff proxy would refuse the POST anyway — so each offers a manual
  // re-entry into the OIDC sign-in. Lockout wins when both are present: the
  // account is blocked either way. Nothing here knows or asks whether it is
  // running in the app; both screens are correct in a plain browser too.
  const arrivalNotice: LoginCardNotice | undefined = isLockedOutArrival
    ? {
        text: t('authentication.lockout', { duration: lockoutDuration }),
        actionLabel: t('authentication.lockoutRetry'),
        actionHref: buildOidcRestartHref(returnUrlFromParam ?? storedReturnUrl ?? '/', platformOrigin),
      }
    : undefined;

  // The app hand-off arrival is the app's sign-in screen: a welcome with room
  // for the brand, sign-in and a way to browse public spaces. It offers no
  // sign-up: inside the app the shell turns /sign_up into the OIDC sign-in, so
  // that button would open the sign-in screen. `required` comes before any
  // attempt and needs no message; after a cancelled or failed attempt the
  // reason sits above the buttons on the same screen.
  if (!flow && !isLockedOutArrival && appSignIn) {
    return (
      <AuthShellWrapper plain={true}>
        <AppSignInWelcome
          signInHref={buildOidcRestartHref(returnUrlFromParam ?? storedReturnUrl ?? '/', platformOrigin)}
          // Absolute against the apex, like the OIDC hand-off, because this page
          // also renders on the identity subdomain where the explorer does not live.
          browseSpacesHref={`${platformOrigin ?? ''}${URL_SPACE_EXPLORER}`}
          message={
            appSignIn === 'required'
              ? undefined
              : { text: tAuth(`appSignIn.${appSignIn}`), tone: appSignIn === 'failed' ? 'destructive' : 'info' }
          }
        />
      </AuthShellWrapper>
    );
  }

  if (!flow && arrivalNotice) {
    return (
      <AuthShellWrapper>
        <LoginCard
          descriptor={undefined}
          isLoading={false}
          notice={arrivalNotice}
          signUpHref={signUpReturnUrl ? buildSignUpUrl(signUpReturnUrl) : AUTH_SIGN_UP_PATH}
          forgotPasswordHref={AUTH_RESET_PASSWORD_PATH}
        />
      </AuthShellWrapper>
    );
  }

  // OIDC entry: a full-page redirect to the BFF login route is in flight (see
  // the useLayoutEffect above). Show the card in its loading state rather than
  // the interactive Kratos form so the user can't complete a bypassing login.
  if (isOidcEntry) {
    return (
      <AuthShellWrapper>
        <LoginCard
          descriptor={undefined}
          isLoading={true}
          signUpHref={
            // Forward the pending returnUrl so a first-time visitor who came
            // for a specific space/subspace keeps that destination through
            // sign-up (bare /sign_up would drop it — they'd land on home).
            signUpReturnUrl ? buildSignUpUrl(signUpReturnUrl) : AUTH_SIGN_UP_PATH
          }
          forgotPasswordHref={AUTH_RESET_PASSWORD_PATH}
        />
      </AuthShellWrapper>
    );
  }

  // The flow on the URL could not be read — most often Kratos answering 403
  // `security_csrf_violation` because the anti-CSRF cookie no longer matches
  // this flow id. Without this branch `descriptor` is undefined and the card
  // falls back to its loading state, so a terminal failure is indistinguishable
  // from "still preparing" and the person waits for ever. Offer the only
  // recovery that actually works: restart at the BFF, which mints a fresh flow
  // *and* a matching cookie. Re-reading this flow id would fail identically.
  if (loginFlowError && !loginFlow && !loading) {
    return (
      <AuthShellWrapper>
        <LoginCard
          descriptor={undefined}
          isLoading={false}
          notice={{
            text: t('authentication.flowUnavailable'),
            actionLabel: t('authentication.flowUnavailableRetry'),
            actionHref: buildOidcRestartHref(returnUrlFromParam ?? storedReturnUrl ?? '/', platformOrigin),
          }}
          signUpHref={signUpReturnUrl ? buildSignUpUrl(signUpReturnUrl) : AUTH_SIGN_UP_PATH}
          forgotPasswordHref={AUTH_RESET_PASSWORD_PATH}
        />
      </AuthShellWrapper>
    );
  }

  return (
    <AuthShellWrapper>
      <LoginCard
        descriptor={stepDescriptor}
        isLoading={loading || isDecidingRefresh}
        signUpHref={
          // Forward the pending returnUrl so a first-time visitor who came
          // for a specific space/subspace keeps that destination through
          // sign-up (bare /sign_up would drop it — they'd land on home).
          signUpReturnUrl ? buildSignUpUrl(signUpReturnUrl) : AUTH_SIGN_UP_PATH
        }
        forgotPasswordHref={AUTH_RESET_PASSWORD_PATH}
        onPasskeyTrigger={(trigger, value) => {
          setPasskeyError(undefined);
          invokePasskeyTrigger(trigger, value).catch(error => {
            setPasskeyError(translatePasskeyError(t, error));
          });
        }}
        secondFactorStep={
          isSecondFactorStep
            ? {
                showingRecoveryCode,
                onToggleRecoveryCode:
                  hasAuthenticatorCode && hasRecoveryCode ? () => setShowRecoveryCode(shown => !shown) : undefined,
              }
            : undefined
        }
      />
    </AuthShellWrapper>
  );
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
  // A hand-off arrival carries no flow id but, like a Kratos refresh login, can
  // legitimately reach this page while the user still holds an `alkemio_session`
  // (Settings > Security re-auth is exactly that case). Exempt it from the guard
  // alongside `flow`, or `NotAuthenticatedRoute` bounces it to the dashboard and
  // the notice never renders.
  const appSignIn = readAppSignIn(params);
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
      <Route
        path="/"
        element={flow || appSignIn ? loginPage : <NotAuthenticatedRoute>{loginPage}</NotAuthenticatedRoute>}
      />
      <Route path="success" element={<LoginSuccessPage />} />
    </Routes>
  );
}
