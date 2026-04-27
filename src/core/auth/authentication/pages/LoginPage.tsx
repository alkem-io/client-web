import { Box } from '@mui/material';
import type { LoginFlow } from '@ory/kratos-client';

import { useEffect, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useReturnUrl } from '@/core/auth/authentication/utils/useSignUpReturnUrl';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { useQueryParams } from '@/core/routing/useQueryParams';
import Loading from '@/core/ui/loading/Loading';
import { ErrorDisplay } from '@/domain/shared/components/ErrorDisplay';
import AuthPageContentContainer from '@/domain/shared/layout/AuthPageContentContainer';
import AuthenticationLayout from '../AuthenticationLayout';
import { AuthFormHeader } from '../components/AuthFormHeader';
import KratosForm from '../components/Kratos/KratosForm';
import KratosUI from '../components/KratosUI';
import {
  AUTH_REMINDER_PATH,
  AUTH_RESET_PASSWORD_PATH,
  PARAM_NAME_RETURN_URL,
} from '../constants/authentication.constants';
import useKratosFlow, { FlowTypeName } from '../hooks/useKratosFlow';
import type { LocationStateWithKratosErrors } from './LocationStateWithKratosErrors';

interface LoginPageProps {
  flow?: string;
}

const EMAIL_NOT_VERIFIED_MESSAGE_ID = 4000010;
// Custom client-side message ID for account lockout (HTTP 429 Too Many Requests).
// Not from Ory Kratos — prefixed with 9xxx to avoid collisions with Kratos message IDs.
const ACCOUNT_LOCKOUT_MESSAGE_ID = 9000429;

const isEmailNotVerified = (flow: LoginFlow) => {
  return (flow.ui?.messages ?? []).some(({ id }) => id === EMAIL_NOT_VERIFIED_MESSAGE_ID);
};

// OIDC BFF entry: when this page is reached without a Kratos flow id, the user
// is starting a fresh sign-in — hand off to alkemio-server's OIDC login route
// (T045). When Kratos itself bounces the browser back here with `?flow=<id>`
// during its self-service login UI render, render the Kratos form as before
// (the flow id is opaque state Kratos owns).
const LoginPage = ({ flow }: LoginPageProps) => {
  const { t } = useTranslation();
  usePageTitle(t('pages.titles.signIn'));

  const params = useQueryParams();
  const returnUrlFromParam = params.get(PARAM_NAME_RETURN_URL) ?? undefined;
  const { returnUrl: storedReturnUrl, setReturnUrl } = useReturnUrl();
  const navigate = useNavigate();
  const { kratosErrors } = (useLocation().state as LocationStateWithKratosErrors | null) ?? {};

  const isOidcEntry = !flow;

  useLayoutEffect(() => {
    if (!isOidcEntry) return;
    if (returnUrlFromParam) {
      setReturnUrl(returnUrlFromParam);
    }
    const returnTo = returnUrlFromParam ?? storedReturnUrl ?? '/';
    window.location.replace(`/api/auth/oidc/login?returnTo=${encodeURIComponent(returnTo)}`);
  }, [isOidcEntry, returnUrlFromParam]);

  const { flow: loginFlow, loading, error } = useKratosFlow(FlowTypeName.Login, flow);

  const isLockedOut = params.get('lockout') === 'true';
  const retryAfterRaw = Number(params.get('retry_after'));
  const retryAfterSeconds = Number.isFinite(retryAfterRaw) ? Math.max(0, retryAfterRaw) : 0;
  const lockoutMinutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));

  const loginUi =
    loginFlow &&
    (() => {
      const ui = structuredClone(loginFlow.ui);
      if (kratosErrors) {
        ui.messages = kratosErrors;
      }
      if (isLockedOut) {
        ui.messages = [
          ...(ui.messages ?? []),
          {
            id: ACCOUNT_LOCKOUT_MESSAGE_ID,
            type: 'error' as const,
            text: t('authentication.lockout', { minutes: lockoutMinutes }),
          },
        ];
      }
      return ui;
    })();

  useEffect(() => {
    if (loginFlow && isEmailNotVerified(loginFlow)) {
      navigate(AUTH_REMINDER_PATH);
    }
  }, [loginFlow, navigate]);

  if (isOidcEntry) {
    return <Loading text={t('kratos.loading-flow')} />;
  }

  if (loading || (!loginFlow && !error)) {
    return <Loading text={t('kratos.loading-flow')} />;
  }

  if (error) {
    return <ErrorDisplay />;
  }

  const resetPassword = (
    <Box
      display="flex"
      justifyContent="start"
      component={Link}
      to={AUTH_RESET_PASSWORD_PATH}
      fontSize={12}
      fontFamily={theme => theme.typography.caption.fontFamily}
      sx={{ color: theme => theme.palette.highlight.dark, textDecoration: 'none' }}
    >
      {t('pages.registration.reset-password')}
    </Box>
  );

  return (
    <AuthenticationLayout>
      <AuthFormHeader title={t('authentication.sign-in')} />
      <KratosForm ui={loginUi}>
        <AuthPageContentContainer>
          <KratosUI ui={loginUi} resetPasswordElement={resetPassword} flowType="login" />
        </AuthPageContentContainer>
      </KratosForm>
    </AuthenticationLayout>
  );
};

export default LoginPage;
