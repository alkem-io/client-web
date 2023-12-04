import React, { useState } from 'react';
import ContributorsSection from './ContributorsSection';
import SpacesSection from '../../../domain/journey/space/DashboardSpaces/SpacesSection';
import HomePageFooter from './HomePageFooter';
import ReleaseUpdatesDialog from '../../../domain/platform/notifications/ReleaseUpdates/ReleaseUpdatesDialog';
import HomePageLayout from './HomePageLayout';
import PageContent from '../../../core/ui/content/PageContent';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import InnovationHubHomePage from '../../../domain/innovationHub/InnovationHubHomePage/InnovationHubHomePage';
import Loading from '../../../core/ui/loading/Loading';
import { useAuthenticationContext } from '../../../core/auth/authentication/hooks/useAuthenticationContext';
import useInnovationHub from '../../../domain/innovationHub/useInnovationHub/useInnovationHub';
import CreateAccountBanner from './CreateAccountBanner';
import RecentJourneysList from '../myDashboard/recentJourneys/RecentJourneysList';
import MyMembershipsDialog from '../myDashboard/myMemberships/MyMembershipsDialog';
import LatestContributions from '../myDashboard/latestContributions/LatestContributions';
import MyLatestContributions from '../myDashboard/latestContributions/MyLatestContributions';

export const HomePage = () => {
  const { isAuthenticated, loading: isLoadingAuthentication } = useAuthenticationContext();

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
        <RecentJourneysList onSeeMore={() => setIsMyMembershipsDialogOpen(true)} />
        <PageContentColumn columns={8}>
          <MyLatestContributions />
          {!isLoadingAuthentication && !isAuthenticated && <CreateAccountBanner />}
          <SpacesSection />
          <ContributorsSection />
          <HomePageFooter />
        </PageContentColumn>
        <PageContentColumn columns={4}>
          <LatestContributions />
        </PageContentColumn>
      </PageContent>
    </HomePageLayout>
  );
};

export default HomePage;
