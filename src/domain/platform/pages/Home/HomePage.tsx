import { Grid, Grow } from '@mui/material';
import React from 'react';
import { SectionSpacer } from '../../../shared/components/Section/Section';
import { useUpdateNavigation } from '../../../../core/routing/useNavigation';
import { useUserContext } from '../../../community/contributor/user';
import ContributorsSection from './ContributorsSection';
import HubsSection from '../../../challenge/hub/DashboardHubs/HubsSection';
import WelcomeSection from './WelcomeSection';
import HomePageFooter from './HomePageFooter';
import AnonymousUserHome from './AnonymousUserHome';
import AuthenticatedUserHome from './AuthenticatedUserHome';
import PlatformUpdates from '../../notifications/ReleaseUpdates/ReleaseUpdatesNotification';
import TopLevelDesktopLayout from '../../../shared/layout/PageLayout/TopLevelDesktopLayout';

const currentPaths = [];

export const HomePage = () => {
  useUpdateNavigation({ currentPaths });

  const user = useUserContext();

  return (
    <TopLevelDesktopLayout>
      <PlatformUpdates />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <WelcomeSection />
        </Grid>
        <Grow appear={!user.loading}>
          {user.isAuthenticated ? <AuthenticatedUserHome user={user} /> : <AnonymousUserHome />}
        </Grow>
        <Grid item xs={12}>
          <HubsSection userHubRoles={user.userHubRoles} loading={user.loading} />
        </Grid>
        <SectionSpacer />
        <Grid item xs={12}>
          <ContributorsSection />
        </Grid>
        <Grid item xs={12}>
          <HomePageFooter />
        </Grid>
      </Grid>
    </TopLevelDesktopLayout>
  );
};

export default HomePage;
