import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import WrapperButton from '../../../../common/components/core/WrapperButton';
import WrapperTypography from '../../../../common/components/core/WrapperTypography';
import AuthenticationLayout from '../../../../common/components/composite/layout/AuthenticationLayout';
import { Box } from '@mui/material';
import EmailVerificationNotice from '../../../../components/EmailVerificationNotice/EmailVerificationNotice';

interface RegistrationSuccessPageProps {}

export const RegistrationSuccessPage: FC<RegistrationSuccessPageProps> = () => {
  const { t } = useTranslation();

  return (
    <AuthenticationLayout sx={{ flexGrow: 1, display: 'flex', flexFlow: 'column nowrap' }}>
      <Box textAlign={'center'}>
        <WrapperTypography variant={'h2'}>
          <CheckCircleOutline
            color="primary"
            sx={{
              fontSize: '8.25rem',
            }}
          />
        </WrapperTypography>
        <WrapperTypography variant={'h2'}>{t('pages.registration-success.header')}</WrapperTypography>
        <WrapperTypography variant={'h3'}>{t('pages.registration-success.subheader')}</WrapperTypography>
      </Box>
      <Box flex="1 0 0" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <EmailVerificationNotice />
      </Box>
      <Box marginTop={4} textAlign={'center'}>
        <WrapperButton as={RouterLink} to={'/'} text={t('buttons.home')} />
      </Box>
    </AuthenticationLayout>
  );
};
export default RegistrationSuccessPage;
