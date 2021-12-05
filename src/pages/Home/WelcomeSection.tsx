import { Button, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Section, { SectionSpacer } from '../../components/core/Section/Section';
import SectionHeader from '../../components/core/Section/SectionHeader';
import SectionSubHeader from '../../components/core/Section/SectionSubheader';
import { useConfig } from '../../hooks';

const WelcomeSection = () => {
  const { platform } = useConfig();
  const { t } = useTranslation();

  const banner = './alkemio-banner.png';

  return (
    <Section bannerUrl={banner}>
      <SectionHeader text={t('pages.home.sections.welcome.header')}>
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
      </SectionHeader>
      <SectionSpacer />
      <SectionSubHeader text={t('pages.home.sections.welcome.subheader')} />
      <SectionSpacer />
      <Typography variant="body1">{t('pages.home.sections.welcome.body')}</Typography>
    </Section>
  );
};

export default WelcomeSection;
