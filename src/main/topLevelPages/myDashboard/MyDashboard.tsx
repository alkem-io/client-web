import React, { useState } from 'react';
import ExploreOtherChallenges from './exploreOtherChallenges/ExploreOtherChallenges';
import ReleaseUpdatesDialog from '../../../domain/platform/notifications/ReleaseUpdates/ReleaseUpdatesDialog';
import HomePageLayout from '../Home/HomePageLayout';
import PageContent from '../../../core/ui/content/PageContent';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import { useAuthenticationContext } from '../../../core/auth/authentication/hooks/useAuthenticationContext';
import CreateAccountBanner from '../Home/CreateAccountBanner';
import RecentJourneysList from './recentJourneys/RecentJourneysList';
import MyMembershipsDialog from './myMemberships/MyMembershipsDialog';
import MoreAboutAlkemio from './moreAboutAlkemio/MoreAboutAlkemio';
import StartingSpace from './startingSpace/StartingSpace';
import RecentForumMessages from './recentForumMessages/RecentForumMessages';
import InnovationLibraryBlock from './innovationLibraryBlock/InnovationLibraryBlock';
import LatestContributions from './latestContributions/LatestContributions';
import MyLatestContributions from './latestContributions/myLatestContributions/MyLatestContributions';
import NewMembershipsBlock from './newMemberships/NewMembershipsBlock';

export const MyDashboard = () => {
  const { isAuthenticated, loading: isLoadingAuthentication } = useAuthenticationContext();

  const [isMyMembershipsDialogOpen, setIsMyMembershipsDialogOpen] = useState(false);

  return (
    <HomePageLayout>
      <ReleaseUpdatesDialog />
      <MyMembershipsDialog open={isMyMembershipsDialogOpen} onClose={() => setIsMyMembershipsDialogOpen(false)} />
      <PageContent>
        <PageContentColumn columns={12}>
          {!isLoadingAuthentication && !isAuthenticated && <CreateAccountBanner />}
          <RecentJourneysList onSeeMore={() => setIsMyMembershipsDialogOpen(true)} />
        </PageContentColumn>
        <PageContentColumn columns={8}>
          <NewMembershipsBlock onOpenMemberships={() => setIsMyMembershipsDialogOpen(true)} />
          <MyLatestContributions />
          <InnovationLibraryBlock />
          <RecentForumMessages />
          <ExploreOtherChallenges />
          <StartingSpace />
          <MoreAboutAlkemio />
        </PageContentColumn>
        <PageContentColumn columns={4}>
          <LatestContributions />
        </PageContentColumn>
      </PageContent>
    </HomePageLayout>
  );
};

export default MyDashboard;
