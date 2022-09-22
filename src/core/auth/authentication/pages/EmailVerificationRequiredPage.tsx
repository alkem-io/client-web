import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import WrapperButton from '../../../../common/components/core/WrapperButton';
import { Box } from '@mui/material';
import AuthenticationLayout from '../../../../common/components/composite/layout/AuthenticationLayout';
import EmailVerificationNotice from '../../verification/components/EmailVerificationNotice/EmailVerificationNotice';
import WrapperTypography from '../../../../common/components/core/WrapperTypography';

export const EmailVerificationRequiredPage: FC = () => {
  const { t } = useTranslation();

  return (
    <AuthenticationLayout sx={{ flexGrow: 1, display: 'flex', flexFlow: 'column nowrap' }}>
      <Box flex="1 0 0" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <WrapperTypography variant={'h2'}>{t('pages.verification-required.header')}</WrapperTypography>
        <EmailVerificationNotice />
      </Box>
      <Box marginTop={4} textAlign={'center'}>
        <WrapperButton as={RouterLink} to={'/'} text={t('buttons.home')} />
      </Box>
    </AuthenticationLayout>
  );
};

export default EmailVerificationRequiredPage;
