import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import Button from '../../components/core/Button';
import Typography from '../../components/core/Typography';
import AuthenticationLayout from '../../components/composite/layout/AuthenticationLayout';
import { Box } from '@mui/material';
import EmailVerificationNotice from '../../components/EmailVerificationNotice/EmailVerificationNotice';

interface RegistrationSuccessPageProps {}

export const RegistrationSuccessPage: FC<RegistrationSuccessPageProps> = () => {
  const { t } = useTranslation();

  return (
    <AuthenticationLayout sx={{ flexGrow: 1, display: 'flex', flexFlow: 'column nowrap' }}>
      <Box textAlign={'center'}>
        <Typography variant={'h2'}>
          <CheckCircleOutline
            color="primary"
            sx={{
              fontSize: '8.25rem',
            }}
          />
        </Typography>
        <Typography variant={'h2'}>{t('pages.registration-success.header')}</Typography>
        <Typography variant={'h3'}>{t('pages.registration-success.subheader')}</Typography>
      </Box>
      <Box flex="1 0 0" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <EmailVerificationNotice />
      </Box>
      <Box marginTop={4} textAlign={'center'}>
        <Button as={RouterLink} to={'/'} text={t('buttons.home')} />
      </Box>
    </AuthenticationLayout>
  );
};
export default RegistrationSuccessPage;
