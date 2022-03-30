import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import KratosUI from '../../components/Authentication/KratosUI';
import AuthenticationLayout from '../../components/composite/layout/AuthenticationLayout';
import Button from '../../components/core/Button';
import Delimiter from '../../components/core/Delimiter';
import Loading from '../../components/core/Loading/Loading';
import Typography from '../../components/core/Typography';
import { useConfig } from '../../hooks';
import { AUTH_LOGIN_PATH } from '../../models/constants';
import useKratosFlow, { FlowTypeName } from '../../hooks/kratos/useKratosFlow';

interface RegisterPageProps {
  flow?: string;
}

export const RegistrationPage: FC<RegisterPageProps> = ({ flow }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { flow: registrationFlow, loading } = useKratosFlow(FlowTypeName.Registration, flow);

  const { platform, loading: loadingPlatform } = useConfig();

  if (loadingPlatform || loading) return <Loading text={t('kratos.loading-flow')} />;

  return (
    <AuthenticationLayout>
      <Grid container spacing={2} justifyContent={'center'}>
        <Grid item sm={4}>
          <Box marginY={3} textAlign={'center'}>
            <Typography variant={'h3'}>{t('pages.registration.header')}</Typography>
          </Box>
          <KratosUI flow={registrationFlow} termsURL={platform?.terms} privacyURL={platform?.privacy} />
          <Delimiter>OR</Delimiter>
          <Typography variant={'h5'}>{t('pages.registration.login')}</Typography>
          <Button
            variant="primary"
            type={'submit'}
            small
            block
            onClick={() => navigate(AUTH_LOGIN_PATH, { replace: true })}
            text={t('authentication.sign-in')}
          />
        </Grid>
      </Grid>
    </AuthenticationLayout>
  );
};
export default RegistrationPage;
