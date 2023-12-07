import { Box, Grow } from '@mui/material';
import React, { useState } from 'react';
import ContributorsSection from './ContributorsSection';
import ExploreOtherChallenges from '../myDashboard/exploreOtherChallenges/ExploreOtherChallenges';
import RecentForumMessages from '../myDashboard/recentForumMessages/RecentForumMessages';
import MoreAboutAlkemio from '../myDashboard/moreAboutAlkemio/MoreAboutAlkemio';
import AnonymousUserHome from './AnonymousUserHome';
import AuthenticatedUserHome from './AuthenticatedUserHome';
import ReleaseUpdatesDialog from '../../../domain/platform/notifications/ReleaseUpdates/ReleaseUpdatesDialog';
import HomePageLayout from './HomePageLayout';
import PageContent from '../../../core/ui/content/PageContent';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import { gutters } from '../../../core/ui/grid/utils';
import { useQueryParams } from '../../../core/routing/useQueryParams';
import InnovationHubHomePage from '../../../domain/innovationHub/InnovationHubHomePage/InnovationHubHomePage';
import Loading from '../../../core/ui/loading/Loading';
import { useAuthenticationContext } from '../../../core/auth/authentication/hooks/useAuthenticationContext';
import useInnovationHub from '../../../domain/innovationHub/useInnovationHub/useInnovationHub';
import CreateAccountBanner from './CreateAccountBanner';
import RecentJourneysList from '../myDashboard/recentJourneys/RecentJourneysList';
import MyMembershipsDialog from '../myDashboard/myMemberships/MyMembershipsDialog';

export const HomePage = () => {
  const { isAuthenticated, loading: isLoadingAuthentication } = useAuthenticationContext();

  const params = useQueryParams();
  const isFromLanding = params.get('from') === 'landing';

  const { innovationHub, innovationHubLoading } = useInnovationHub();

  const [isMyMembershipsDialogOpen, setIsMyMembershipsDialogOpen] = useState(false);

  if (innovationHubLoading) {
    return (
      <HomePageLayout>
        <Loading />
      </HomePageLayout>
    );
  }

  if (innovationHub) {
    return <InnovationHubHomePage innovationHub={innovationHub} />;
  }

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
          <ExploreOtherChallenges />
          <ContributorsSection />
          <RecentForumMessages />
          <MoreAboutAlkemio />
        </PageContentColumn>
      </PageContent>
    </HomePageLayout>
  );
};

export default HomePage;
