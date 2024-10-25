import React from 'react';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import CampaignBlock from './campaignBlock/CampaignBlock';
import InfoColumn from '../../../core/ui/content/InfoColumn';
import ContentColumn from '../../../core/ui/content/ContentColumn';
import { useLatestReleaseDiscussionQuery } from '../../../core/apollo/generated/apollo-hooks';
import ReleaseNotesBanner from './releaseNotesBanner/ReleaseNotesBanner';
import { DashboardMenu } from './DashboardMenu/DashboardMenu';
import ExploreSpaces from './ExploreSpaces/ExploreSpaces';
import PageContentBlock from '../../../core/ui/content/PageContentBlock';
import { InvitationsBlock } from './InvitationsBlock/InvitationsBlock';

const MyDashboardWithoutMemberships = () => {
  const { data } = useLatestReleaseDiscussionQuery({
    fetchPolicy: 'network-only',
  });

  return (
    <PageContentColumn columns={12}>
      <InfoColumn>
        <DashboardMenu compact />
      </InfoColumn>
      <ContentColumn>
        {data?.platform.latestReleaseDiscussion && <ReleaseNotesBanner />}
        <CampaignBlock />
        <InvitationsBlock />
        <PageContentBlock columns={12}>
          <ExploreSpaces itemsLimit={16} />
        </PageContentBlock>
        {/* TODO: implement create space btn component */}
      </ContentColumn>
    </PageContentColumn>
  );
};

export default MyDashboardWithoutMemberships;
