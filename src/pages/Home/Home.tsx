import { Box, Grid } from '@mui/material';
import React, { useMemo } from 'react';
import { SectionSpacer } from '../../components/core/Section/Section';
import { useUpdateNavigation } from '../../hooks';
import AlkemioActivitySection from './AlkemioActivitySection';
import EcoversesSection from './EcoversesSection';
import LoginSection from './LoginSection';
import WelcomeSection from './WelcomeSection';

export const HomePage = () => {
  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });

  return (
    <>
      <Box padding={1} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <WelcomeSection />
          <SectionSpacer />
          <LoginSection />
          <SectionSpacer />
        </Grid>
        <Grid item xs={12} md={6}>
          <AlkemioActivitySection />
          <SectionSpacer />
          <EcoversesSection />
        </Grid>
      </Grid>
    </>
  );
};

export default HomePage;
