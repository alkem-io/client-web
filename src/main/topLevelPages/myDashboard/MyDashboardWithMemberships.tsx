import React, { Suspense } from 'react';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import ReleaseNotesBanner from './releaseNotesBanner/ReleaseNotesBanner';
import { useLatestReleaseDiscussionQuery } from '@/core/apollo/generated/apollo-hooks';
import CampaignBlock from './Campaigns/CampaignBlock';
import InfoColumn from '@/core/ui/content/InfoColumn';
import { DashboardMenu } from './DashboardMenu/DashboardMenu';
import ContentColumn from '@/core/ui/content/ContentColumn';
import { useDashboardContext } from './DashboardContext';
import MyResources from './myResources/MyResources';
import { Theme, useMediaQuery } from '@mui/material';

const DashboardDialogs = React.lazy(() => import('./DashboardDialogs/DashboardDialogs'));
const DashboardActivity = React.lazy(() => import('./DashboardWithMemberships/DashboardActivity'));
const DashboardSpaces = React.lazy(() => import('./DashboardWithMemberships/DashboardSpaces/DashboardSpaces'));

const MyDashboardWithMemberships = () => {
  const { activityEnabled } = useDashboardContext();
  const { data } = useLatestReleaseDiscussionQuery({
    fetchPolicy: 'network-only',
  });

  // using the isMobile convention but this is actually a tablet breakpoint
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

  return (
    <PageContentColumn columns={12}>
      {!isMobile && (
        <InfoColumn>
          <DashboardMenu />
          <MyResources />
        </InfoColumn>
      )}
      <ContentColumn>
        {isMobile && <DashboardMenu expandable />}
        {data?.platform.latestReleaseDiscussion && <ReleaseNotesBanner />}
        <CampaignBlock />
        {!activityEnabled && (
          <Suspense fallback={null}>
            <DashboardSpaces />
          </Suspense>
        )}
        {activityEnabled && (
          <Suspense fallback={null}>
            <DashboardActivity />
          </Suspense>
        )}
      </ContentColumn>
      <Suspense fallback={null}>
        <DashboardDialogs />
      </Suspense>
    </PageContentColumn>
  );
};

export default MyDashboardWithMemberships;
