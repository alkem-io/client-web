import React, { FC } from 'react';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import RecentSpacesList from './recentSpaces/RecentJourneysList';
import RecentForumMessages from './recentForumMessages/RecentForumMessages';
import InnovationLibraryBlock from './innovationLibraryBlock/InnovationLibraryBlock';
import LatestContributions from './latestContributions/LatestContributions';
import MyLatestContributions from './latestContributions/myLatestContributions/MyLatestContributions';
import TipsAndTricks from './tipsAndTricks/TipsAndTricks';
import NewMembershipsBlock from './newMemberships/NewMembershipsBlock';
import ExploreOtherChallenges from './exploreOtherChallenges/ExploreOtherChallenges';
import { useColumns } from '../../../core/ui/grid/GridContext';
import ReleaseNotesBanner from './releaseNotesBanner/ReleaseNotesBanner';
import { useLatestReleaseDiscussionQuery } from '../../../core/apollo/generated/apollo-hooks';
import MyAccountBlock from './myAccount/MyAccountBlock';
import { LatestContributionsSpacesFlatQuery } from '../../../core/apollo/generated/graphql-schema';

interface MyDashboardWithMembershipsProps {
  spacesData: LatestContributionsSpacesFlatQuery | undefined;
  onOpenMembershipsDialog: () => void;
}

const MyDashboardWithMemberships: FC<MyDashboardWithMembershipsProps> = ({ spacesData, onOpenMembershipsDialog }) => {
  const columns = useColumns();

  const { data } = useLatestReleaseDiscussionQuery({
    fetchPolicy: 'network-only',
  });
  // TODO: need to check here that child memberships should be done via flat or hierarchical space memberships query
  const flatSpacesWithMemberships = spacesData?.me.spaceMembershipsFlat.map(membership => membership.space);

  return (
    <>
      <PageContentColumn columns={columns}>
        <RecentSpacesList onSeeMore={() => onOpenMembershipsDialog()} />
      </PageContentColumn>
      <PageContentColumn columns={columns === 12 ? 4 : 8} flexDirection="column" alignSelf="stretch">
        <NewMembershipsBlock hiddenIfEmpty />
        <LatestContributions spaceMemberships={flatSpacesWithMemberships} />
        <RecentForumMessages />
      </PageContentColumn>
      <PageContentColumn columns={8}>
        {data?.platform.latestReleaseDiscussion && <ReleaseNotesBanner />}
        <MyAccountBlock />
        <MyLatestContributions />
        <TipsAndTricks halfWidth />
        <InnovationLibraryBlock halfWidth />
        <ExploreOtherChallenges />
      </PageContentColumn>
    </>
  );
};

export default MyDashboardWithMemberships;
