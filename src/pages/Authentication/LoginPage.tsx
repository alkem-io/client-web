import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { FC, useLayoutEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import KratosUI from '../../components/Authentication/KratosUI';
import AuthenticationLayout from '../../components/composite/layout/AuthenticationLayout';
import Button from '../../components/core/Button';
import Delimiter from '../../components/core/Delimiter';
import Loading from '../../components/core/Loading/Loading';
import Typography from '../../components/core/Typography';
import { useUpdateNavigation } from '../../hooks';
import { AUTH_REGISTER_PATH } from '../../models/constants';
import { SelfServiceLoginFlow } from '@ory/kratos-client';
import useKratosFlow, { FlowTypeName } from '../../hooks/kratos/useKratosFlow';

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

export const LoginPage: FC<LoginPageProps> = ({ flow }) => {
  const { flow: loginFlow, loading } = useKratosFlow(FlowTypeName.Login, flow);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });

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
  }, [loginFlow]);

  if (loading) return <Loading text={t('kratos.loading-flow')} />;

  const resetPassword = (
    <Box display={'flex'} justifyContent={'flex-end'}>
      <Link to={'/identity/recovery'}>Reset password</Link>
    </Box>
  );

  return (
    <AuthenticationLayout>
      <Grid container spacing={2} justifyContent={'center'}>
        <Grid item sm={4}>
          <Box marginY={3} textAlign={'center'}>
            <Typography variant={'h3'}>{t('pages.login.title')}</Typography>
          </Box>
          <KratosUI flow={loginFlow} resetPasswordComponent={resetPassword} />
          <Delimiter>OR</Delimiter>
          <Typography variant={'h5'}>{t('pages.login.register')}</Typography>
          <Button
            variant="primary"
            type="submit"
            small
            block
            onClick={() => navigate(AUTH_REGISTER_PATH, { replace: true })}
            text={t('authentication.sign-up')}
          />
        </Grid>
      </Grid>
    </AuthenticationLayout>
  );
};

export default LoginPage;
