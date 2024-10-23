import React, { FC } from 'react';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import MyAccountBlock from './myAccount/MyAccountBlock';
import InfoColumn from '../../../core/ui/content/InfoColumn';
import ContentColumn from '../../../core/ui/content/ContentColumn';
import { useLatestReleaseDiscussionQuery } from '../../../core/apollo/generated/apollo-hooks';
import ReleaseNotesBanner from './releaseNotesBanner/ReleaseNotesBanner';
import DashboardMenu from './DashboardMenu/DashboardMenu';
import MyDashboardUnauthenticated from './MyDashboardUnauthenticated';

const MyDashboardWithoutMemberships: FC = () => {
  const { data } = useLatestReleaseDiscussionQuery({
    fetchPolicy: 'network-only',
  });

  return (
    <PageContentColumn columns={12}>
      <InfoColumn>
        <DashboardMenu />
      </InfoColumn>
      <ContentColumn>
        {data?.platform.latestReleaseDiscussion && <ReleaseNotesBanner />} {/* TODO: tweak to match design */}
        {/* TODO: implement and import here the pending memberships block */}
        <MyAccountBlock /> {/* TODO: modify, simplify and match the requirements */}
        <MyDashboardUnauthenticated /> {/* TODO: tweak to match design */}
      </ContentColumn>
    </PageContentColumn>
  );
};

export default MyDashboardWithoutMemberships;
