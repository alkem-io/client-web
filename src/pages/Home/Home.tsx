import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as Globe } from 'bootstrap-icons/icons/globe2.svg';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import Icon from '../../components/core/Icon';
import { useUpdateNavigation } from '../../hooks';
import EcoversesSection from './EcoversesSection';
import WelcomeSection from './WelcomeSection';
import QuickStatsSection from './QuickStatsSection';
import LoginSection from './LoginSection';
import { Box, Grid } from '@mui/material';

export const HomePage = () => {
  const { t } = useTranslation();

  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });

  return (
    <>
      <Box padding={1} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <WelcomeSection />
          <Box padding={1} />
          <LoginSection />
        </Grid>
        <Grid item xs={12} md={6}>
          <QuickStatsSection />
        </Grid>
      </Grid>
      <Section avatar={<Icon component={Globe} color="primary" size="xl" />}>
        <SectionHeader text={t('pages.home.sections.ecoverse.header')} />
        <SubHeader text={t('pages.home.sections.ecoverse.subheader')} />
        <Body text={t('pages.home.sections.ecoverse.body')} />
      </Section>
      <EcoversesSection />
    </>
  );
};

export default HomePage;
