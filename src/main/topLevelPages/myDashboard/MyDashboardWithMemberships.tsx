import React, { FC } from 'react';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import CreateAccountBanner from '../Home/CreateAccountBanner';
import RecentJourneysList from './recentJourneys/RecentJourneysList';
import MoreAboutAlkemio from './moreAboutAlkemio/MoreAboutAlkemio';
import StartingSpace from './startingSpace/StartingSpace';
import RecentForumMessages from './recentForumMessages/RecentForumMessages';
import InnovationLibraryBlock from './innovationLibraryBlock/InnovationLibraryBlock';
import LatestContributions from './latestContributions/LatestContributions';
import MyLatestContributions from './latestContributions/myLatestContributions/MyLatestContributions';
import MembershipSuggestions from './membershipSuggestions/MembershipSuggestions';
import TipsAndTricks from './tipsAndTricks/TipsAndTricks';
import NewMembershipsBlock from './newMemberships/NewMembershipsBlock';
import ExploreOtherChallenges from './exploreOtherChallenges/ExploreOtherChallenges';
import { LatestContributionsSpacesQuery } from '../../../core/apollo/generated/graphql-schema';
import { useAuthenticationContext } from '../../../core/auth/authentication/hooks/useAuthenticationContext';
import { useColumns } from '../../../core/ui/grid/GridContext';

interface MyDashboardWithMembershipsProps {
  spacesData: LatestContributionsSpacesQuery | undefined;
  onOpenMembershipsDialog: () => void;
}

const MyDashboardWithMemberships: FC<MyDashboardWithMembershipsProps> = ({ spacesData, onOpenMembershipsDialog }) => {
  const { isAuthenticated, loading: isLoadingAuthentication } = useAuthenticationContext();
  const columns = useColumns();
  return (
    <>
      <PageContentColumn columns={columns}>
        {!isLoadingAuthentication && !isAuthenticated && <CreateAccountBanner />}
        <RecentJourneysList onSeeMore={() => onOpenMembershipsDialog()} />
      </PageContentColumn>
      <PageContentColumn columns={columns === 8 ? 8 : 4} flexDirection="column" alignSelf="stretch">
        <LatestContributions spaceMemberships={spacesData?.me.spaceMemberships} />
        <RecentForumMessages />
      </PageContentColumn>
      <PageContentColumn columns={8}>
        <NewMembershipsBlock onOpenMemberships={() => onOpenMembershipsDialog()} />
        <MyLatestContributions />
        <MembershipSuggestions />
        <TipsAndTricks />
        <InnovationLibraryBlock />
        <ExploreOtherChallenges />
        <StartingSpace width="100%" />
        <MoreAboutAlkemio />
      </PageContentColumn>
    </>
  );
};

export default MyDashboardWithMemberships;
