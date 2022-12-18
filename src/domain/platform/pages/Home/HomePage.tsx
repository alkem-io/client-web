import { Grid, Grow } from '@mui/material';
import React from 'react';
import { SectionSpacer } from '../../../shared/components/Section/Section';
import { useUserContext } from '../../../community/contributor/user';
import ContributorsSection from './ContributorsSection';
import HubsSection from '../../../challenge/hub/DashboardHubs/HubsSection';
import WelcomeSection from './WelcomeSection';
import HomePageFooter from './HomePageFooter';
import AnonymousUserHome from './AnonymousUserHome';
import AuthenticatedUserHome from './AuthenticatedUserHome';
import PlatformUpdates from '../../notifications/ReleaseUpdates/ReleaseUpdatesNotification';
import HomePageLayout from './HomePageLayout';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';

export const HomePage = () => {
  const user = useUserContext();

  return (
    <HomePageLayout>
      <WelcomeSection />
      <PageContent>
        <PageContentColumn columns={12}>
          <PlatformUpdates />
          <Grow appear={!user.loading}>
            {user.isAuthenticated ? <AuthenticatedUserHome user={user} /> : <AnonymousUserHome />}
          </Grow>
          <HubsSection userHubRoles={user.userHubRoles} loading={user.loading} />
          <SectionSpacer />
          <Grid item xs={12}>
            <ContributorsSection />
          </Grid>
          <Grid item xs={12}>
            <HomePageFooter />
          </Grid>
        </PageContentColumn>
      </PageContent>
    </HomePageLayout>
  );
};

export default HomePage;
