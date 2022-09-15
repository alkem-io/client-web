import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import Button from '../../../../common/components/core/Button';
import { Box } from '@mui/material';
import AuthenticationLayout from '../../../../common/components/composite/layout/AuthenticationLayout';
import EmailVerificationNotice from '../../../../components/EmailVerificationNotice/EmailVerificationNotice';
import Typography from '../../../../common/components/core/Typography';

export const EmailVerificationRequiredPage: FC = () => {
  const { t } = useTranslation();

  return (
    <AuthenticationLayout sx={{ flexGrow: 1, display: 'flex', flexFlow: 'column nowrap' }}>
      <Box flex="1 0 0" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Typography variant={'h2'}>{t('pages.verification-required.header')}</Typography>
        <EmailVerificationNotice />
      </Box>
      <Box marginTop={4} textAlign={'center'}>
        <Button as={RouterLink} to={'/'} text={t('buttons.home')} />
      </Box>
    </AuthenticationLayout>
  );
};

export default EmailVerificationRequiredPage;
