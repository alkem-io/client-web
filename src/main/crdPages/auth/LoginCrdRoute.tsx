import type { TFunction } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import {
  AUTH_REMINDER_PATH,
  AUTH_RESET_PASSWORD_PATH,
  AUTH_SIGN_UP_PATH,
  PARAM_NAME_RETURN_URL,
  STORAGE_KEY_RETURN_URL,
} from '@/core/auth/authentication/constants/authentication.constants';
import useKratosFlow, { FlowTypeName } from '@/core/auth/authentication/hooks/useKratosFlow';
import usePasskeyScript from '@/core/auth/authentication/hooks/usePasskeyScript';
import type { LocationStateWithKratosErrors } from '@/core/auth/authentication/pages/LocationStateWithKratosErrors';
import LoginSuccessPage from '@/core/auth/authentication/pages/LoginSuccessPage';
import { NotAuthenticatedRoute } from '@/core/routing/NotAuthenticatedRoute';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useQueryParams } from '@/core/routing/useQueryParams';
import type { KratosFlowDescriptor, KratosMessage } from '@/crd/components/auth/flowDescriptor';
import { LoginCard } from '@/crd/components/auth/LoginCard';
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
 * CRD login route — the un-gated replacement for the MUI `LoginRoute`.
 * Mirrors its structure: the login screen at `/` and the post-login
 * success handler at `/success`.
 */
export function LoginCrdRoute() {
  const params = useQueryParams();
  const flow = params.get('flow') || undefined;
  const returnUrl = params.get(PARAM_NAME_RETURN_URL);

  useEffect(() => {
    if (returnUrl) {
      sessionStorage.setItem(STORAGE_KEY_RETURN_URL, returnUrl);
    }
  }, [returnUrl]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <NotAuthenticatedRoute>
            <CrdLoginPage flow={flow} />
          </NotAuthenticatedRoute>
        }
      />
      <Route path="success" element={<LoginSuccessPage />} />
    </Routes>
  );
}
