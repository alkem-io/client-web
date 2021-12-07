import { Button, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import { useConfig } from '../../hooks';

const WelcomeSection = () => {
  const { platform } = useConfig();
  const { t } = useTranslation();

  const banner = './alkemio-banner.png';

  return (
    <DashboardGenericSection
      bannerUrl={banner}
      headerText={t('pages.home.sections.welcome.header')}
      subHeaderText={t('pages.home.sections.welcome.subheader')}
      primaryAction={
        <Button
          color="primary"
          variant="contained"
          LinkComponent={'a'}
          href={platform?.feedback || ''}
          target="_blank"
          sx={{ flexShrink: 0 }}
        >
          Contact us
        </Button>
      }
    >
      <Typography variant="body1">{t('pages.home.sections.welcome.body')}</Typography>
    </DashboardGenericSection>
  );
};

export default WelcomeSection;
