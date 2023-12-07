import { Box, Grow } from '@mui/material';
import React, { useState } from 'react';
import ContributorsSection from '../Home/ContributorsSection';
import SpacesSection from '../../../domain/journey/space/DashboardSpaces/SpacesSection';
import AnonymousUserHome from '../Home/AnonymousUserHome';
import AuthenticatedUserHome from '../Home/AuthenticatedUserHome';
import ReleaseUpdatesDialog from '../../../domain/platform/notifications/ReleaseUpdates/ReleaseUpdatesDialog';
import HomePageLayout from '../Home/HomePageLayout';
import PageContent from '../../../core/ui/content/PageContent';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import { gutters } from '../../../core/ui/grid/utils';
import { useQueryParams } from '../../../core/routing/useQueryParams';
import { useAuthenticationContext } from '../../../core/auth/authentication/hooks/useAuthenticationContext';
import CreateAccountBanner from '../Home/CreateAccountBanner';
import RecentJourneysList from './recentJourneys/RecentJourneysList';
import MyMembershipsDialog from './myMemberships/MyMembershipsDialog';
import MoreAboutAlkemio from './moreAboutAlkemio/MoreAboutAlkemio';
import RecentForumMessages from './recentForumMessages/RecentForumMessages';

export const MyDashboard = () => {
  const { isAuthenticated, loading: isLoadingAuthentication } = useAuthenticationContext();

  const params = useQueryParams();
  const isFromLanding = params.get('from') === 'landing';

  const [isMyMembershipsDialogOpen, setIsMyMembershipsDialogOpen] = useState(false);

  return (
    <HomePageLayout>
      <ReleaseUpdatesDialog />
      <MyMembershipsDialog open={isMyMembershipsDialogOpen} onClose={() => setIsMyMembershipsDialogOpen(false)} />
      <PageContent>
        <PageContentColumn columns={12}>
          {!isLoadingAuthentication && !isAuthenticated && <CreateAccountBanner />}
          <RecentJourneysList onSeeMore={() => setIsMyMembershipsDialogOpen(true)} />
          {!isFromLanding && (
            <Grow in={!isLoadingAuthentication} appear>
              <Box display="flex" flexDirection="column" gap={gutters()} flexGrow={1} maxWidth="100%">
                {isAuthenticated ? <AuthenticatedUserHome /> : <AnonymousUserHome />}
              </Box>
            </Grow>
          )}
          <SpacesSection />
          <ContributorsSection />
          <RecentForumMessages />
          <MoreAboutAlkemio />
        </PageContentColumn>
      </PageContent>
    </HomePageLayout>
  );
};

export default MyDashboard;
