import { Button, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import { useAuthenticationContext } from '../../hooks';
import { AUTH_REGISTER_PATH } from '../../models/constants';

const WelcomeSection = () => {
  const { t } = useTranslation();

  const { isAuthenticated } = useAuthenticationContext();
  const banner = './alkemio-banner-ukraine.png';

  return (
    <DashboardGenericSection
      bannerUrl={banner}
      headerText={t('pages.home.sections.welcome.header')}
      subHeaderText={t('pages.home.sections.welcome.subheader')}
      primaryAction={
        !isAuthenticated && (
          <Button
            color="primary"
            variant="contained"
            LinkComponent={'a'}
            href={AUTH_REGISTER_PATH}
            sx={{ flexShrink: 0 }}
          >
            {t('authentication.sign-up')}
          </Button>
        )
      }
    >
      <Typography variant="body1">{t('pages.home.sections.welcome.body')}</Typography>
    </DashboardGenericSection>
  );
};

export default WelcomeSection;
