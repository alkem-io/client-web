import React, { useState } from 'react';
import RecentJourneysList from '../recentSpaces/RecentJourneysList';
import LatestContributions from '../latestContributions/LatestContributions';
import MyLatestContributions from '../latestContributions/myLatestContributions/MyLatestContributions';
import { MyMembershipsDialog } from '../myMemberships/MyMembershipsDialog';
import { useLatestContributionsSpacesFlatQuery, useMyMembershipsQuery } from '@/core/apollo/generated/apollo-hooks';
import { useColumns } from '@/core/ui/grid/GridContext';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';
import { Theme, useMediaQuery } from '@mui/material';
import { SpaceIcon } from '@/domain/journey/space/icon/SpaceIcon';

const DashboardActivity = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const columns = useColumns();

  const [isMyMembershipsDialogOpen, setIsMyMembershipsDialogOpen] = useState(false);
  const { data: spacesData } = useLatestContributionsSpacesFlatQuery();
  const flatSpacesWithMemberships = spacesData?.me.spaceMembershipsFlat.map(membership => membership.space);

  const { data: myMembershipsData, loading: myMembershipsLoading } = useMyMembershipsQuery({
    skip: !isMyMembershipsDialogOpen,
  });

  const blockColumns = isMobile ? columns : columns / 2;

  const renderSpaceActivityBlock = () => (
    <PageContentColumn key="space-activity" columns={blockColumns}>
      <PageContentBlock>
        <PageContentBlockHeader title={t('pages.home.sections.latestContributions.title')} />
        <LatestContributions spaceMemberships={flatSpacesWithMemberships} />
      </PageContentBlock>
    </PageContentColumn>
  );

  const renderMyActivityBlock = () => (
    <PageContentColumn key="my-activity" columns={blockColumns}>
      <PageContentBlock>
        <PageContentBlockHeader title={t('pages.home.sections.myLatestContributions.title')} />
        <MyLatestContributions spaceMemberships={flatSpacesWithMemberships} />
      </PageContentBlock>
    </PageContentColumn>
  );

  return (
    <>
      <RecentJourneysList onSeeMore={() => setIsMyMembershipsDialogOpen(true)} />
      {!isMobile && [renderSpaceActivityBlock(), renderMyActivityBlock()]}
      {isMobile && [renderMyActivityBlock(), renderSpaceActivityBlock()]}
      <MyMembershipsDialog
        Icon={SpaceIcon}
        loading={myMembershipsLoading}
        open={isMyMembershipsDialogOpen}
        title={t('pages.home.sections.myMemberships.title')}
        data={myMembershipsData?.me?.spaceMembershipsHierarchical ?? []}
        onClose={() => setIsMyMembershipsDialogOpen(false)}
      />
    </>
  );
};

export default DashboardActivity;
