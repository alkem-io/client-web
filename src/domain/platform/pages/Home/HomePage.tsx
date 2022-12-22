import { Box, Grow } from '@mui/material';
import React from 'react';
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
import { gutters } from '../../../../core/ui/grid/utils';

export const HomePage = () => {
  const user = useUserContext();

  return (
    <HomePageLayout>
      <WelcomeSection />
      <PageContent>
        <PageContentColumn columns={12}>
          <PlatformUpdates />
          <Grow in={!user.loading} appear>
            <Box display="flex" flexDirection="column" gap={gutters()} flexGrow={1}>
              {user.isAuthenticated ? <AuthenticatedUserHome user={user} /> : <AnonymousUserHome />}
            </Box>
          </Grow>
          <HubsSection userHubRoles={user.userHubRoles} loading={user.loading} />
          <ContributorsSection />
          <HomePageFooter />
        </PageContentColumn>
      </PageContent>
    </HomePageLayout>
  );
};

export default HomePage;
