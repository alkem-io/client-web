import React, { FC } from 'react';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import CreateAccountBanner from '../Home/CreateAccountBanner';
import MoreAboutAlkemio from './moreAboutAlkemio/MoreAboutAlkemio';
import StartingSpace from './startingSpace/StartingSpace';
import RecentForumMessages from './recentForumMessages/RecentForumMessages';
import InnovationLibraryBlock from './innovationLibraryBlock/InnovationLibraryBlock';
import TipsAndTricks from './tipsAndTricks/TipsAndTricks';
import ExploreOtherChallenges from './exploreOtherChallenges/ExploreOtherChallenges';
import { useColumns } from '../../../core/ui/grid/GridContext';

interface MyDashboardUnauthenticatedProps {}

const MyDashboardUnauthenticated: FC<MyDashboardUnauthenticatedProps> = () => {
  const columns = useColumns();
  return (
    <>
      <PageContentColumn columns={columns}>
        <CreateAccountBanner />
      </PageContentColumn>
      <PageContentColumn columns={columns === 12 ? 4 : 8} flexDirection="column" alignSelf="stretch">
        <TipsAndTricks />
        <InnovationLibraryBlock />
        <RecentForumMessages />
      </PageContentColumn>
      <PageContentColumn columns={8}>
        <ExploreOtherChallenges />
        <StartingSpace width="100%" />
        <MoreAboutAlkemio />
      </PageContentColumn>
    </>
  );
};

export default MyDashboardUnauthenticated;
