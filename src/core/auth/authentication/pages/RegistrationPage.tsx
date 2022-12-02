import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import KratosUI from '../components/KratosUI';
import AuthenticationLayout from '../../../../common/components/composite/layout/AuthenticationLayout';
import WrapperButton from '../../../../common/components/core/WrapperButton';
import Delimiter from '../../../../common/components/core/Delimiter';
import Loading from '../../../../common/components/core/Loading/Loading';
import WrapperTypography from '../../../../common/components/core/WrapperTypography';
import useKratosFlow, { FlowTypeName } from '../../../../core/auth/authentication/hooks/useKratosFlow';
import { useConfig } from '../../../../domain/platform/config/useConfig';
import { AUTH_LOGIN_PATH } from '../constants/authentication.constants';
import { ErrorDisplay } from '../../../../domain/shared/components/ErrorDisplay';

interface RegisterPageProps {
  flow?: string;
}

export const RegistrationPage: FC<RegisterPageProps> = ({ flow }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { flow: registrationFlow, loading, error } = useKratosFlow(FlowTypeName.Registration, flow);

  const { platform, loading: loadingPlatform } = useConfig();

  if (loadingPlatform || loading) {
    return <Loading text={t('kratos.loading-flow')} />;
  }

  if (error) {
    return <ErrorDisplay />;
  }

  return (
    <AuthenticationLayout>
      <Grid container spacing={2} justifyContent={'center'}>
        <Grid item sm={4}>
          <Box marginY={3} textAlign={'center'}>
            <WrapperTypography variant={'h3'}>{t('pages.registration.header')}</WrapperTypography>
          </Box>
          <KratosUI flow={registrationFlow} termsURL={platform?.terms} privacyURL={platform?.privacy} />
          <Delimiter>OR</Delimiter>
          <WrapperTypography variant={'h5'}>{t('pages.registration.login')}</WrapperTypography>
          <WrapperButton
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
