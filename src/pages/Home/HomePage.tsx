import { Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { SectionSpacer } from '../../domain/shared/components/Section/Section';
import { useUpdateNavigation, useUserContext } from '../../hooks';
import AlkemioActivitySection from './AlkemioActivitySection';
import ContributorsSection from './ContributorsSection';
import HubsSection from './HubsSection';
import GettingStartedSection from './GettingStartedSection';
import ShowInterestSection from './ShowInterestSection';
import WelcomeSection from './WelcomeSection';
import MyHubsSection from '../../domain/hub/MyHubs/MyHubsSection';

const useStyles = makeStyles(_ => ({
  grow: {
    flexGrow: 1,
  },
}));

const currentPaths = [];

export const HomePage = () => {
  useUpdateNavigation({ currentPaths });

  const styles = useStyles();

  const user = useUserContext();

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
        {user.isAuthenticated && (
          <Grid item xs={12}>
            <MyHubsSection userHubRoles={user.userHubRoles} loading={user.loading} />
          </Grid>
        )}
        <Grid item xs={12}>
          <HubsSection />
        </Grid>
        <SectionSpacer />
        <Grid item xs={12}>
          <ContributorsSection />
        </Grid>
      </Grid>
    </>
  );
};

export default HomePage;
