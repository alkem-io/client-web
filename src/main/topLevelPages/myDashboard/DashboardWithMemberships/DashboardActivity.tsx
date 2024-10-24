import React, { useState } from 'react';
import RecentSpacesList from '../recentSpaces/RecentJourneysList';
import LatestContributions from '../latestContributions/LatestContributions';
import MyLatestContributions from '../latestContributions/myLatestContributions/MyLatestContributions';
import MyMembershipsDialog from '../myMemberships/MyMembershipsDialog';
import { useLatestContributionsSpacesFlatQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useColumns } from '../../../../core/ui/grid/GridContext';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';

const DashboardActivity = () => {
  const [isMyMembershipsDialogOpen, setIsMyMembershipsDialogOpen] = useState(false);
  const { data: spacesData } = useLatestContributionsSpacesFlatQuery();
  const flatSpacesWithMemberships = spacesData?.me.spaceMembershipsFlat.map(membership => membership.space);

  const columns = useColumns();

  return (
    <>
      <RecentSpacesList onSeeMore={() => setIsMyMembershipsDialogOpen(true)} />
      <PageContentColumn columns={columns / 2}>
        <LatestContributions spaceMemberships={flatSpacesWithMemberships} />
      </PageContentColumn>
      <PageContentColumn columns={columns / 2}>
        <MyLatestContributions />
      </PageContentColumn>
      <MyMembershipsDialog open={isMyMembershipsDialogOpen} onClose={() => setIsMyMembershipsDialogOpen(false)} />
    </>
  );
};

export default DashboardActivity;
