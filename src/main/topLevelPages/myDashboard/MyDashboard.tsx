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
import MembershipSuggestions from './membershipSuggestions/MembershipSuggestions';
import TipsAndTricks from './tipsAndTricks/TipsAndTricks';
import NewMembershipsBlock from './newMemberships/NewMembershipsBlock';
import { useLatestContributionsSpacesQuery } from '../../../core/apollo/generated/apollo-hooks';
import Loading from '../../../core/ui/loading/Loading';

export const MyDashboard = () => {
  const { isAuthenticated, loading: isLoadingAuthentication } = useAuthenticationContext();

  const [isMyMembershipsDialogOpen, setIsMyMembershipsDialogOpen] = useState(false);

  const { data: spacesData, loading: areSpacesLoading } = useLatestContributionsSpacesQuery();

  if (areSpacesLoading) {
    return (
      <HomePageLayout>
        <Loading />
      </HomePageLayout>
    );
  }

  const hasSpaceMemberships = !!spacesData?.me.spaceMemberships.length;

  return (
    <HomePageLayout>
      <ReleaseUpdatesDialog />
      <MyMembershipsDialog open={isMyMembershipsDialogOpen} onClose={() => setIsMyMembershipsDialogOpen(false)} />
      <PageContent>
        <PageContentColumn columns={12}>
          {!isLoadingAuthentication && !isAuthenticated && <CreateAccountBanner />}
          {hasSpaceMemberships && <RecentJourneysList onSeeMore={() => setIsMyMembershipsDialogOpen(true)} />}
        </PageContentColumn>
        <PageContentColumn columns={8}>
          <NewMembershipsBlock onOpenMemberships={() => setIsMyMembershipsDialogOpen(true)} />
          <MyLatestContributions />
          <MembershipSuggestions />
          {hasSpaceMemberships && <TipsAndTricks />}
          {hasSpaceMemberships && <InnovationLibraryBlock />}
          <ExploreOtherChallenges />
          <StartingSpace width="100%" />
          {hasSpaceMemberships && <MoreAboutAlkemio />}
        </PageContentColumn>
        <PageContentColumn columns={4} flexDirection="column" alignSelf="stretch">
          {!hasSpaceMemberships && <TipsAndTricks />}
          {!hasSpaceMemberships && <InnovationLibraryBlock />}
          {hasSpaceMemberships && <LatestContributions spaceMemberships={spacesData?.me.spaceMemberships} />}
          <RecentForumMessages />
        </PageContentColumn>
        {!hasSpaceMemberships && (
          <PageContentColumn columns={12}>
            <MoreAboutAlkemio />
          </PageContentColumn>
        )}
      </PageContent>
    </HomePageLayout>
  );
};

export default MyDashboard;
