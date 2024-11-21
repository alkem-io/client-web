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
import { lazyWithGlobalErrorHandler } from '../../../core/lazyLoading/lazyWithGlobalErrorHandler';
import Loading from '../../../core/ui/loading/Loading';

const DashboardDialogs = lazyWithGlobalErrorHandler(() => import('./DashboardDialogs/DashboardDialogs'));
const DashboardActivity = lazyWithGlobalErrorHandler(() => import('./DashboardWithMemberships/DashboardActivity'));
const DashboardSpaces = lazyWithGlobalErrorHandler(
  () => import('./DashboardWithMemberships/DashboardSpaces/DashboardSpaces')
);

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
          <Suspense fallback={<Loading />}>
            <DashboardSpaces />
          </Suspense>
        )}
        {activityEnabled && (
          <Suspense fallback={<Loading />}>
            <DashboardActivity />
          </Suspense>
        )}
      </ContentColumn>
      <Suspense fallback={<Loading />}>
        <DashboardDialogs />
      </Suspense>
    </PageContentColumn>
  );
};

export default MyDashboardWithMemberships;
