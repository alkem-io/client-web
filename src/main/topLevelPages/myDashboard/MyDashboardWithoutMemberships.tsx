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

interface MyDashboardWithoutMembershipsProps {
  onOpenMembershipsDialog: () => void;
}

const MyDashboardWithoutMemberships: FC<MyDashboardWithoutMembershipsProps> = ({ onOpenMembershipsDialog }) => {
  const columns = useColumns();
  return (
    <>
      <PageContentColumn columns={12}>
        <MyAccountBlock />
        <MyLatestContributions />
        <NewMembershipsBlock hiddenIfEmpty onOpenMemberships={onOpenMembershipsDialog} />
        <ExploreOtherChallenges />
      </PageContentColumn>
      <PageContentColumn columns={columns === 12 ? 4 : 8} flexDirection="column" alignSelf="stretch">
        <TipsAndTricks />
        <InnovationLibraryBlock />
        <RecentForumMessages />
      </PageContentColumn>
      <MoreAboutAlkemio />
    </>
  );
};

export default MyDashboardWithoutMemberships;
