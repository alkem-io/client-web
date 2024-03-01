import React, { FC } from 'react';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import RecentJourneysList from './recentJourneys/RecentJourneysList';
import MoreAboutAlkemio from './moreAboutAlkemio/MoreAboutAlkemio';
import StartingSpace from './startingSpace/StartingSpace';
import RecentForumMessages from './recentForumMessages/RecentForumMessages';
import InnovationLibraryBlock from './innovationLibraryBlock/InnovationLibraryBlock';
import LatestContributions from './latestContributions/LatestContributions';
import MyLatestContributions from './latestContributions/myLatestContributions/MyLatestContributions';
import TipsAndTricks from './tipsAndTricks/TipsAndTricks';
import NewMembershipsBlock from './newMemberships/NewMembershipsBlock';
import ExploreOtherChallenges from './exploreOtherChallenges/ExploreOtherChallenges';
import { LatestContributionsSpacesQuery } from '../../../core/apollo/generated/graphql-schema';
import { useColumns } from '../../../core/ui/grid/GridContext';
import ReleaseNotesBanner from './releaseNotesBanner/ReleaseNotesBanner';

interface MyDashboardWithMembershipsProps {
  spacesData: LatestContributionsSpacesQuery | undefined;
  onOpenMembershipsDialog: () => void;
}

const MyDashboardWithMemberships: FC<MyDashboardWithMembershipsProps> = ({ spacesData, onOpenMembershipsDialog }) => {
  const columns = useColumns();

  return (
    <>
      <PageContentColumn columns={columns}>
        <RecentJourneysList onSeeMore={() => onOpenMembershipsDialog()} />
      </PageContentColumn>
      <PageContentColumn columns={columns === 12 ? 4 : 8} flexDirection="column" alignSelf="stretch">
        <LatestContributions spaceMemberships={spacesData?.me.spaceMemberships} />
        <RecentForumMessages />
      </PageContentColumn>
      <PageContentColumn columns={8}>
        <ReleaseNotesBanner />
        <NewMembershipsBlock halfWidth onOpenMemberships={onOpenMembershipsDialog} />
        <MyLatestContributions />
        <TipsAndTricks halfWidth />
        <InnovationLibraryBlock halfWidth />
        <ExploreOtherChallenges />
        <StartingSpace />
        <MoreAboutAlkemio />
      </PageContentColumn>
    </>
  );
};

export default MyDashboardWithMemberships;
