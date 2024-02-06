import React, { FC } from 'react';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import MoreAboutAlkemio from './moreAboutAlkemio/MoreAboutAlkemio';
import StartingSpace from './startingSpace/StartingSpace';
import RecentForumMessages from './recentForumMessages/RecentForumMessages';
import InnovationLibraryBlock from './innovationLibraryBlock/InnovationLibraryBlock';
import MembershipSuggestions from './membershipSuggestions/MembershipSuggestions';
import TipsAndTricks from './tipsAndTricks/TipsAndTricks';
import ExploreOtherChallenges from './exploreOtherChallenges/ExploreOtherChallenges';
import { useColumns } from '../../../core/ui/grid/GridContext';
import NewMembershipsBlock from './newMemberships/NewMembershipsBlock';

interface MyDashboardWithoutMembershipsProps {
  onOpenMembershipsDialog: () => void;
}

const MyDashboardWithoutMemberships: FC<MyDashboardWithoutMembershipsProps> = ({ onOpenMembershipsDialog }) => {
  const columns = useColumns();
  return (
    <>
      <PageContentColumn columns={8}>
        <MembershipSuggestions />
        <ExploreOtherChallenges />
        <StartingSpace width="100%" />
      </PageContentColumn>
      <PageContentColumn columns={columns === 12 ? 4 : 8} flexDirection="column" alignSelf="stretch">
        <NewMembershipsBlock onOpenMemberships={() => onOpenMembershipsDialog()} />
        <TipsAndTricks />
        <InnovationLibraryBlock />
        <RecentForumMessages />
      </PageContentColumn>
      <MoreAboutAlkemio />
    </>
  );
};

export default MyDashboardWithoutMemberships;
