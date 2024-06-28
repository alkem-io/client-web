import React, { FC } from 'react';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import MoreAboutAlkemio from './moreAboutAlkemio/MoreAboutAlkemio';
import RecentForumMessages from './recentForumMessages/RecentForumMessages';
import InnovationLibraryBlock from './innovationLibraryBlock/InnovationLibraryBlock';
import TipsAndTricks from './tipsAndTricks/TipsAndTricks';
import ExploreOtherChallenges from './exploreOtherChallenges/ExploreOtherChallenges';
import { useColumns } from '../../../core/ui/grid/GridContext';
import NewMembershipsBlock from './newMemberships/NewMembershipsBlock';
import MyAccountBlock from './myAccount/MyAccountBlock';
import MyLatestContributions from './latestContributions/myLatestContributions/MyLatestContributions';
import MembershipSuggestions from './membershipSuggestions/MembershipSuggestions';

interface MyDashboardWithoutMembershipsProps {
  onOpenMembershipsDialog: () => void;
}

const MyDashboardWithoutMemberships: FC<MyDashboardWithoutMembershipsProps> = ({ onOpenMembershipsDialog }) => {
  const columns = useColumns();
  return (
    <>
      <PageContentColumn columns={12}>
        <MyAccountBlock />
        <MembershipSuggestions />
      </PageContentColumn>
      <PageContentColumn columns={8}>
        <TipsAndTricks halfWidth />
        <InnovationLibraryBlock halfWidth />
      </PageContentColumn>
      <PageContentColumn columns={columns === 12 ? 4 : 8} flexDirection="column" alignSelf="stretch">
        <MyLatestContributions />
        <RecentForumMessages />
        <NewMembershipsBlock hiddenIfEmpty onOpenMemberships={onOpenMembershipsDialog} />
      </PageContentColumn>
      <PageContentColumn columns={8}>
        <ExploreOtherChallenges />
      </PageContentColumn>
      <MoreAboutAlkemio />
    </>
  );
};

export default MyDashboardWithoutMemberships;
