import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import Button from '../../components/core/Button';
import Typography from '../../components/core/Typography';
import { Typography as MUITypography } from '@mui/material';
import AuthenticationLayout from '../../components/composite/layout/AuthenticationLayout';
import { Box } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export const EmailVerificationReminderPage: FC = () => {
  const { t } = useTranslation();

  return (
    <AuthenticationLayout sx={{ flexGrow: 1, display: 'flex', flexFlow: 'column nowrap' }}>
      <Box textAlign={'center'}>
        <CheckCircleOutline
          color="primary"
          sx={{
            fontSize: '8.25rem',
          }}
        />
      </Box>
      <Box flex="1 0 0" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Typography variant={'h2'}>{t('pages.verification-reminder.header')}</Typography>
        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center">
          <ErrorOutlineIcon
            color="primary"
            sx={theme => ({
              fontSize: '3rem',
              marginRight: theme.spacing(3),
            })}
          />
          <MUITypography variant="h3" sx={{ fontWeight: 'normal' }}>
            {t('pages.verification-reminder.message')}
          </MUITypography>
        </Box>
      </Box>
      <Box marginTop={4} textAlign={'center'}>
        <Button as={RouterLink} to={'/'} text={t('buttons.home')} />
      </Box>
    </AuthenticationLayout>
  );
};

export default EmailVerificationReminderPage;
