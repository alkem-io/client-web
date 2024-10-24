import React from 'react';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import ReleaseNotesBanner from './releaseNotesBanner/ReleaseNotesBanner';
import { useLatestReleaseDiscussionQuery } from '../../../core/apollo/generated/apollo-hooks';
import MyAccountBlock from './myAccount/MyAccountBlock';
import InfoColumn from '../../../core/ui/content/InfoColumn';
import DashboardMenu from './DashboardMenu/DashboardMenu';
import ContentColumn from '../../../core/ui/content/ContentColumn';
import DashboardActivity from './DashboardWithMemberships/DashboardActivity';
import DashboardSpaces from './DashboardWithMemberships/DashboardSpaces';
import { useDashboardContext } from './DashboardContext';

const MyDashboardWithMemberships = () => {
  const { activityEnebled } = useDashboardContext();
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
        <MyAccountBlock />
        {activityEnebled ? <DashboardActivity /> : <DashboardSpaces />}
      </ContentColumn>
    </PageContentColumn>
  );
};

export default MyDashboardWithMemberships;
