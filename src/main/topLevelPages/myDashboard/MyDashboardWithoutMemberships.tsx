import React, { FC } from 'react';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import CreateAccountBanner from '../Home/CreateAccountBanner';
import MoreAboutAlkemio from './moreAboutAlkemio/MoreAboutAlkemio';
import StartingSpace from './startingSpace/StartingSpace';
import RecentForumMessages from './recentForumMessages/RecentForumMessages';
import InnovationLibraryBlock from './innovationLibraryBlock/InnovationLibraryBlock';
import MyLatestContributions from './latestContributions/myLatestContributions/MyLatestContributions';
import MembershipSuggestions from './membershipSuggestions/MembershipSuggestions';
import TipsAndTricks from './tipsAndTricks/TipsAndTricks';
import NewMembershipsBlock from './newMemberships/NewMembershipsBlock';
import ExploreOtherChallenges from './exploreOtherChallenges/ExploreOtherChallenges';
import { useAuthenticationContext } from '../../../core/auth/authentication/hooks/useAuthenticationContext';
import { useColumns } from '../../../core/ui/grid/GridContext';

interface MyDashboardWithoutMembershipsProps {
  onOpenMembershipsDialog: () => void;
}

const MyDashboardWithoutMemberships: FC<MyDashboardWithoutMembershipsProps> = ({ onOpenMembershipsDialog }) => {
  const { isAuthenticated, loading: isLoadingAuthentication } = useAuthenticationContext();
  const columns = useColumns();
  return (
    <>
      <PageContentColumn columns={columns}>
        {!isLoadingAuthentication && !isAuthenticated && <CreateAccountBanner />}
      </PageContentColumn>
      <PageContentColumn columns={columns === 8 ? 8 : 4} flexDirection="column" alignSelf="stretch">
        <TipsAndTricks />
        <InnovationLibraryBlock />
        <RecentForumMessages />
      </PageContentColumn>
      <PageContentColumn columns={8}>
        <NewMembershipsBlock onOpenMemberships={() => onOpenMembershipsDialog()} />
        <MyLatestContributions />
        <MembershipSuggestions />
        <ExploreOtherChallenges />
        <StartingSpace width="100%" />
        <MoreAboutAlkemio />
      </PageContentColumn>
    </>
  );
};

export default MyDashboardWithoutMemberships;
