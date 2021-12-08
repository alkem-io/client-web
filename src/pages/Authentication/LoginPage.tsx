import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';
import KratosUI from '../../components/Authentication/KratosUI';
import AuthenticationLayout from '../../components/composite/layout/AuthenticationLayout';
import Button from '../../components/core/Button';
import Delimiter from '../../components/core/Delimiter';
import Loading from '../../components/core/Loading/Loading';
import Typography from '../../components/core/Typography';
import { useUpdateNavigation } from '../../hooks';
import { useKratos } from '../../hooks';
import { AUTH_REGISTER_PATH } from '../../models/constants';

interface LoginPageProps {
  flow?: string;
}

export const LoginPage: FC<LoginPageProps> = ({ flow }) => {
  const { loginFlow, getLoginFlow, loading } = useKratos();
  const history = useHistory();
  const { t } = useTranslation();

  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });

  useEffect(() => {
    getLoginFlow(flow);
  }, [getLoginFlow, flow]);

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
            type={'submit'}
            small
            block
            onClick={() => history.push(AUTH_REGISTER_PATH)}
            text={t('authentication.sign-up')}
          />
        </Grid>
      </Grid>
    </AuthenticationLayout>
  );
};

export default LoginPage;
