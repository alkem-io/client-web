import React, { Suspense } from 'react';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import ReleaseNotesBanner from './releaseNotesBanner/ReleaseNotesBanner';
import { useLatestReleaseDiscussionQuery } from '../../../core/apollo/generated/apollo-hooks';
import CampaignBlock from './CampaignBlock/CampaignBlock';
import InfoColumn from '../../../core/ui/content/InfoColumn';
import { DashboardMenu } from './DashboardMenu/DashboardMenu';
import ContentColumn from '../../../core/ui/content/ContentColumn';
import { useDashboardContext } from './DashboardContext';

const DashboardDialogs = React.lazy(() => import('./DashboardDialogs/DashboardDialogs'));
const DashboardActivity = React.lazy(() => import('./DashboardWithMemberships/DashboardActivity'));
const DashboardSpaces = React.lazy(() => import('./DashboardWithMemberships/DashboardSpaces'));

const MyDashboardWithMemberships = () => {
  const { activityEnabled } = useDashboardContext();
  const { data } = useLatestReleaseDiscussionQuery({
    fetchPolicy: 'network-only',
  });

  return (
    <PageContentColumn columns={12}>
      <InfoColumn>
        <DashboardMenu />
      </InfoColumn>
      <ContentColumn>
        {data?.platform.latestReleaseDiscussion && <ReleaseNotesBanner />}
        <CampaignBlock />
        {activityEnabled ? <DashboardActivity /> : <DashboardSpaces />}
      </ContentColumn>
      <Suspense fallback={null}>
        <DashboardDialogs />
      </Suspense>
    </PageContentColumn>
  );
};

export default MyDashboardWithMemberships;
