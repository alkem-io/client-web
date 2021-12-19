import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useMemo } from 'react';
import { SectionSpacer } from '../../components/core/Section/Section';
import { useUpdateNavigation } from '../../hooks';
import AlkemioActivitySection from './AlkemioActivitySection';
import ContributorsSection from './ContributorsSection';
import EcoversesSection from './EcoversesSection';
import GettingStartedSection from './GettingStartedSection';
import ShowInterestSection from './ShowInterestSection';
import WelcomeSection from './WelcomeSection';

const useStyles = makeStyles(_ => ({
  grow: {
    flexGrow: 1,
  },
}));

export const HomePage = () => {
  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });

  const styles = useStyles();

  return (
    <>
      <SectionSpacer />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} display="flex" flexDirection="column">
          <WelcomeSection />
          <SectionSpacer />
          <AlkemioActivitySection
            classes={{
              section: {
                root: styles.grow,
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={6} display="flex" flexDirection="column">
          <GettingStartedSection />
          <SectionSpacer />
          <ShowInterestSection
            classes={{
              section: {
                root: styles.grow,
              },
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <EcoversesSection />
        </Grid>
        <Grid item xs={12}>
          <ContributorsSection />
        </Grid>
      </Grid>
    </>
  );
};

export default HomePage;
