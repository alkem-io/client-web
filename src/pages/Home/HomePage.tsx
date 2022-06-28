import { Grid, Grow } from '@mui/material';
import React from 'react';
import { SectionSpacer } from '../../domain/shared/components/Section/Section';
import { useUpdateNavigation, useUserContext } from '../../hooks';
import ContributorsSection from './ContributorsSection';
import HubsSection from '../../domain/hub/DashboardHubs/HubsSection';
import WelcomeSection from './WelcomeSection';
import HomePageFooter from './HomePageFooter';
import AnonymousUserHome from './AnonymousUserHome';
import AuthenticatedUserHome from './AuthenticatedUserHome';

const currentPaths = [];

export const HomePage = () => {
  useUpdateNavigation({ currentPaths });

  const user = useUserContext();

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <WelcomeSection />
        </Grid>
        <Grow appear={!user.loading}>
          {user.isAuthenticated ? <AuthenticatedUserHome user={user} /> : <AnonymousUserHome />}
        </Grow>
        <Grid item xs={12}>
          <HubsSection />
        </Grid>
        <SectionSpacer />
        <Grid item xs={12}>
          <ContributorsSection />
        </Grid>
        <Grid item xs={12}>
          <HomePageFooter />
        </Grid>
      </Grid>
    </>
  );
};

export default HomePage;
