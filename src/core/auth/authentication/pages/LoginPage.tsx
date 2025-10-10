import { Box } from '@mui/material';
import { produce } from 'immer';
import AuthPageContentContainer from '@/domain/shared/layout/AuthPageContentContainer';
import useKratosFlow, { FlowTypeName } from '../hooks/useKratosFlow';
import KratosUI from '../components/KratosUI';
import { useEffect, useLayoutEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Loading from '@/core/ui/loading/Loading';
import { useTranslation } from 'react-i18next';
import { LoginFlow } from '@ory/kratos-client';
import {
  AUTH_REMINDER_PATH,
  AUTH_RESET_PASSWORD_PATH,
  PARAM_NAME_RETURN_URL,
} from '../constants/authentication.constants';
import { ErrorDisplay } from '@/domain/shared/components/ErrorDisplay';
import { LocationStateWithKratosErrors } from './LocationStateWithKratosErrors';
import KratosForm from '../components/Kratos/KratosForm';
import AuthenticationLayout from '../AuthenticationLayout';
import { AuthFormHeader } from '../components/AuthFormHeader';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { useReturnUrl } from '@/core/auth/authentication/utils/useSignUpReturnUrl';

interface LoginPageProps {
  flow?: string;
}

const EMAIL_NOT_VERIFIED_MESSAGE_ID = 4000010;

const isEmailNotVerified = (flow: LoginFlow) => {
  return (flow.ui?.messages ?? []).some(({ id }) => id === EMAIL_NOT_VERIFIED_MESSAGE_ID);
};

// See a TODO below
// const EMAIL_FIELD_NAME = 'password_identifier';
//
// const getEmailAddress = (flow: LoginFlow): string | undefined => {
//   const node = flow.ui.nodes.find((node ) => {
//     const attributes = node.attributes as UiNodeInputAttributes;
//     return attributes.name === EMAIL_FIELD_NAME;
//   });
//   return node && (node.attributes as UiNodeInputAttributes).value;
// };

const LoginPage = ({ flow }: LoginPageProps) => {
  const { flow: loginFlow, loading, error } = useKratosFlow(FlowTypeName.Login, flow);
  const navigate = useNavigate();
  const { kratosErrors } = (useLocation().state as LocationStateWithKratosErrors | null) ?? {};
  const { t } = useTranslation();
  const params = useQueryParams();
  const returnUrl = params.get(PARAM_NAME_RETURN_URL);
  const { setReturnUrl } = useReturnUrl();

  // Ory 1.3.0: messages should be set on flow.ui.messages
  const loginUi =
    loginFlow &&
    produce(loginFlow.ui, ui => {
      if (kratosErrors) {
        ui.messages = kratosErrors;
      }
    });

  useEffect(() => {
    setReturnUrl(returnUrl);
  }, [returnUrl, setReturnUrl]);

  useLayoutEffect(() => {
    if (loginFlow && isEmailNotVerified(loginFlow)) {
      // TODO When Kratos starts sending email value back, this snippet may be used
      // to allow users request the verification email once again
      // without having to input email manually.
      // const email = getEmailAddress(loginFlow);
      // const params = new URLSearchParams();
      // if (email) {
      //   params.set('email', email);
      // }
      navigate(AUTH_REMINDER_PATH);
    }
  }, [loginFlow, navigate]);

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
