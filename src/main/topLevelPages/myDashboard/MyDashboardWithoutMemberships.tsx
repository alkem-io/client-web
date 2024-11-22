import React, { Suspense } from 'react';
import { Button, Theme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import CampaignBlock from './Campaigns/CampaignBlock';
import InfoColumn from '@/core/ui/content/InfoColumn';
import ContentColumn from '@/core/ui/content/ContentColumn';
import { useLatestReleaseDiscussionQuery } from '@/core/apollo/generated/apollo-hooks';
import ReleaseNotesBanner from './releaseNotesBanner/ReleaseNotesBanner';
import { DashboardMenu } from './DashboardMenu/DashboardMenu';
import ExploreSpaces from './ExploreSpaces/ExploreSpaces';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import { InvitationsBlock } from './InvitationsBlock/InvitationsBlock';
import { SpaceIcon } from '@/domain/journey/space/icon/SpaceIcon';
import RouterLink from '@/core/ui/link/RouterLink';
import { useCreateSpaceLink } from './useCreateSpaceLink/useCreateSpaceLink';
import { lazyWithGlobalErrorHandler } from '../../../core/lazyLoading/lazyWithGlobalErrorHandler';
import Loading from '../../../core/ui/loading/Loading';

const DashboardDialogs = lazyWithGlobalErrorHandler(() => import('./DashboardDialogs/DashboardDialogs'));

const MyDashboardWithoutMemberships = () => {
  const { t } = useTranslation();
  const { link: createSpaceLink, loading } = useCreateSpaceLink();
  const { data } = useLatestReleaseDiscussionQuery({
    fetchPolicy: 'network-only',
  });

  // using the isMobile convention but this is actually a tablet breakpoint
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

  return (
    <PageContentColumn columns={12}>
      {!isMobile && (
        <InfoColumn>
          <DashboardMenu compact />
        </InfoColumn>
      )}
      <ContentColumn>
        {isMobile && <DashboardMenu compact expandable />}
        {data?.platform.latestReleaseDiscussion && <ReleaseNotesBanner />}
        <CampaignBlock />
        <InvitationsBlock />
        <PageContentBlock columns={12}>
          <ExploreSpaces itemsLimit={16} />
        </PageContentBlock>
        <Button
          component={RouterLink}
          to={createSpaceLink}
          disabled={loading}
          variant="outlined"
          startIcon={<SpaceIcon />}
          sx={{
            background: theme => theme.palette.background.paper,
            flex: 1,
            textTransform: 'none',
          }}
        >
          {t('buttons.createOwnSpace')}
        </Button>
      </ContentColumn>
      <Suspense fallback={<Loading />}>
        <DashboardDialogs />
      </Suspense>
    </PageContentColumn>
  );
};

export default MyDashboardWithoutMemberships;
