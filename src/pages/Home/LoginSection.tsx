import { Button, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Section from '../../components/core/Section/Section';
import { useAuthenticationContext } from '../../hooks';
import { AUTH_LOGIN_PATH } from '../../models/constants';

const LoginSection = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthenticationContext();

  return !isAuthenticated ? (
    <Section>
      <Typography variant="body1">{t('pages.home.sections.welcome.join')}</Typography>
      <Button LinkComponent={'a'} href={AUTH_LOGIN_PATH}>
        {t('authentication.sign-in')}
      </Button>
    </Section>
  ) : (
    <></>
  );
};

export default LoginSection;
