import React, { Suspense } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import CampaignBlock from './Campaigns/CampaignBlock';
import InfoColumn from '../../../core/ui/content/InfoColumn';
import ContentColumn from '../../../core/ui/content/ContentColumn';
import { useLatestReleaseDiscussionQuery } from '../../../core/apollo/generated/apollo-hooks';
import ReleaseNotesBanner from './releaseNotesBanner/ReleaseNotesBanner';
import { DashboardMenu } from './DashboardMenu/DashboardMenu';
import ExploreSpaces from './ExploreSpaces/ExploreSpaces';
import PageContentBlock from '../../../core/ui/content/PageContentBlock';
import { InvitationsBlock } from './InvitationsBlock/InvitationsBlock';
import { CreateSpaceBtn } from './createSpaceBtn/CreateSpaceBtn';
import { SpaceIcon } from '../../../domain/journey/space/icon/SpaceIcon';

const DashboardDialogs = React.lazy(() => import('./DashboardDialogs/DashboardDialogs'));

const MyDashboardWithoutMemberships = () => {
  const { t } = useTranslation();
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
        <CreateSpaceBtn
          component={Button}
          variant="outlined"
          startIcon={<SpaceIcon />}
          sx={{
            background: theme => theme.palette.background.paper,
            flex: 1,
            textTransform: 'none',
          }}
        >
          {t('buttons.createOwnSpace')}
        </CreateSpaceBtn>
      </ContentColumn>
      <Suspense fallback={null}>
        <DashboardDialogs />
      </Suspense>
    </PageContentColumn>
  );
};

export default MyDashboardWithoutMemberships;
