import React, { useCallback, useState } from 'react';
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
import { Caption } from '@/core/ui/typography';
import { useDashboardContext } from '../DashboardContext';
import { DashboardDialog } from '../DashboardDialogs/DashboardDialogsProps';

const DashboardActivity = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const columns = useColumns();

  const [showLatestActivitiesShowMore, setShowLatestActivitiesShowMore] = useState(false);
  const [showMyLatestActivitiesShowMore, setShowMyLatestActivitiesShowMore] = useState(false);
  const [isMyMembershipsDialogOpen, setIsMyMembershipsDialogOpen] = useState(false);
  const { data: spacesData } = useLatestContributionsSpacesFlatQuery();
  const flatSpacesWithMemberships = spacesData?.me.spaceMembershipsFlat.map(membership => membership.space);

  const { data: myMembershipsData, loading: myMembershipsLoading } = useMyMembershipsQuery({
    skip: !isMyMembershipsDialogOpen,
  });

  const { setIsOpen } = useDashboardContext();

  const blockColumns = isMobile ? columns : columns / 2;

  const renderShowMoreButton = (dialog: DashboardDialog) => (
    <Caption sx={{ marginLeft: 'auto', cursor: 'pointer' }} onClick={() => setIsOpen(dialog)}>
      {t('common.show-more')}
    </Caption>
  );

  const renderSpaceActivityBlock = useCallback(
    () => (
      <PageContentColumn key="space-activity" columns={blockColumns}>
        <PageContentBlock>
          <PageContentBlockHeader title={t('pages.home.sections.latestContributions.title')} />
          <LatestContributions
            limit={10}
            spaceMemberships={flatSpacesWithMemberships}
            makeShowMoreButtonVisible={(isVisible: boolean) => setShowLatestActivitiesShowMore(isVisible)}
          />

          {showLatestActivitiesShowMore && renderShowMoreButton(DashboardDialog.MySpaceActivity)}
        </PageContentBlock>
      </PageContentColumn>
    ),
    [
      blockColumns,
      flatSpacesWithMemberships,
      showLatestActivitiesShowMore,
      t,
      renderShowMoreButton,
      setShowLatestActivitiesShowMore,
    ]
  );

  const renderMyActivityBlock = useCallback(
    () => (
      <PageContentColumn key="my-activity" columns={blockColumns}>
        <PageContentBlock>
          <PageContentBlockHeader title={t('pages.home.sections.myLatestContributions.title')} />
          <MyLatestContributions
            limit={10}
            spaceMemberships={flatSpacesWithMemberships}
            makeShowMoreButtonVisible={(isVisible: boolean) => setShowMyLatestActivitiesShowMore(isVisible)}
          />

          {showMyLatestActivitiesShowMore && renderShowMoreButton(DashboardDialog.MyActivity)}
        </PageContentBlock>
      </PageContentColumn>
    ),
    [
      blockColumns,
      flatSpacesWithMemberships,
      showMyLatestActivitiesShowMore,
      t,
      renderShowMoreButton,
      setShowMyLatestActivitiesShowMore,
    ]
  );

  return (
    <>
      <RecentJourneysList onSeeMore={() => setIsMyMembershipsDialogOpen(true)} />
      {isMobile
        ? [renderMyActivityBlock(), renderSpaceActivityBlock()]
        : [renderSpaceActivityBlock(), renderMyActivityBlock()]}

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
