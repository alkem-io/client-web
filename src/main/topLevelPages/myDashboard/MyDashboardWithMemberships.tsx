import React, { FC } from 'react';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import RecentSpacesList from './recentSpaces/RecentJourneysList';
import MoreAboutAlkemio from './moreAboutAlkemio/MoreAboutAlkemio';
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
import { useLatestReleaseDiscussionQuery } from '../../../core/apollo/generated/apollo-hooks';
import MyAccountBlock from './myAccount/MyAccountBlock';

interface MyDashboardWithMembershipsProps {
  spacesData: LatestContributionsSpacesQuery | undefined;
  onOpenMembershipsDialog: () => void;
}

const MyDashboardWithMemberships: FC<MyDashboardWithMembershipsProps> = ({ spacesData, onOpenMembershipsDialog }) => {
  const columns = useColumns();

  const { data } = useLatestReleaseDiscussionQuery({
    fetchPolicy: 'network-only',
  });

  return (
    <>
      <PageContentColumn columns={columns}>
        <RecentSpacesList onSeeMore={() => onOpenMembershipsDialog()} />
      </PageContentColumn>
      <PageContentColumn columns={12}>
        {data?.platform.latestReleaseDiscussion && <ReleaseNotesBanner />}
        <MyAccountBlock />
        <MyLatestContributions />
        <NewMembershipsBlock onOpenMemberships={onOpenMembershipsDialog} />
      </PageContentColumn>
      <PageContentColumn columns={columns === 12 ? 4 : 8} flexDirection="column" alignSelf="stretch">
        <LatestContributions spaceMemberships={spacesData?.me.spaceMemberships} />
        <RecentForumMessages />
      </PageContentColumn>
      <PageContentColumn columns={8}>
        <TipsAndTricks halfWidth />
        <InnovationLibraryBlock halfWidth />
        <ExploreOtherChallenges />
        <MoreAboutAlkemio />
      </PageContentColumn>
    </>
  );
};

export default MyDashboardWithMemberships;
