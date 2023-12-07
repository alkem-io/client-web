import React, { useState } from 'react';
import ContributorsSection from '../Home/ContributorsSection';
import SpacesSection from '../../../domain/journey/space/DashboardSpaces/SpacesSection';
import ReleaseUpdatesDialog from '../../../domain/platform/notifications/ReleaseUpdates/ReleaseUpdatesDialog';
import HomePageLayout from '../Home/HomePageLayout';
import PageContent from '../../../core/ui/content/PageContent';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import { useAuthenticationContext } from '../../../core/auth/authentication/hooks/useAuthenticationContext';
import CreateAccountBanner from '../Home/CreateAccountBanner';
import RecentJourneysList from './recentJourneys/RecentJourneysList';
import MyMembershipsDialog from './myMemberships/MyMembershipsDialog';
import MoreAboutAlkemio from './moreAboutAlkemio/MoreAboutAlkemio';
import LatestContributions from './latestContributions/LatestContributions';
import MyLatestContributions from './latestContributions/MyLatestContributions';

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
          <MyLatestContributions />
          <SpacesSection />
          <ContributorsSection />
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
