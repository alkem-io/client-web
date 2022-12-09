import { Box } from '@mui/material';
import produce from 'immer';
import Container from '../../../../domain/shared/layout/Container';
import { sxCols } from '../../../../domain/shared/layout/Grid';
import SubHeading from '../../../../domain/shared/components/Text/SubHeading';
import Paragraph from '../../../../domain/shared/components/Text/Paragraph';
import FixedHeightLogo from '../components/FixedHeightLogo';
import useKratosFlow, { FlowTypeName } from '../hooks/useKratosFlow';
import KratosUI from '../components/KratosUI';
import React, { useLayoutEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Loading from '../../../../common/components/core/Loading/Loading';
import { useTranslation } from 'react-i18next';
import { SelfServiceLoginFlow } from '@ory/kratos-client';
import translateWithElements from '../../../../domain/shared/i18n/TranslateWithElements/TranslateWithElements';
import { AUTH_SIGN_UP_PATH } from '../constants/authentication.constants';
import { ErrorDisplay } from '../../../../domain/shared/components/ErrorDisplay';
import { LocationStateWithKratosErrors } from './LocationStateWithKratosErrors';
import KratosForm from '../components/Kratos/KratosForm';

interface LoginPageProps {
  flow?: string;
}

const EMAIL_NOT_VERIFIED_MESSAGE_ID = 4000010;

const isEmailNotVerified = (flow: SelfServiceLoginFlow) => {
  return flow.ui.messages?.some(({ id }) => id === EMAIL_NOT_VERIFIED_MESSAGE_ID);
};

// See a TODO below
// const EMAIL_FIELD_NAME = 'password_identifier';
//
// const getEmailAddress = (flow: SelfServiceLoginFlow): string | undefined => {
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

  const loginUi =
    loginFlow &&
    produce(loginFlow.ui, ui => {
      if (kratosErrors) {
        ui.messages = kratosErrors;
      }
    });

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
      navigate('/identity/verify/reminder');
    }
  }, [loginFlow, navigate]);

  if (loading) {
    return <Loading text={t('kratos.loading-flow')} />;
  }

  if (error) {
    return <ErrorDisplay />;
  }

  const resetPassword = (
    <Box
      display="flex"
      justifyContent="end"
      paddingX={2}
      component={Link}
      to="/identity/recovery"
      fontSize={12}
      fontFamily={theme => theme.typography.caption.fontFamily}
      fontWeight={600}
      sx={{ color: theme => theme.palette.primary.main }}
    >
      Reset password
    </Box>
  );

  const tLink = translateWithElements(<Link to="" />);

  return (
    <KratosForm ui={loginUi}>
      <Container marginTop={9} maxWidth={sxCols(7)} gap={4}>
        <FixedHeightLogo />
        <SubHeading>{t('pages.login.title')}</SubHeading>
        <KratosUI ui={loginUi} resetPasswordElement={resetPassword} />
        <Paragraph textAlign="center" marginTop={5}>
          {tLink('pages.login.register', {
            signup: { to: AUTH_SIGN_UP_PATH },
          })}
        </Paragraph>
      </Container>
    </KratosForm>
  );
};

export default LoginPage;
