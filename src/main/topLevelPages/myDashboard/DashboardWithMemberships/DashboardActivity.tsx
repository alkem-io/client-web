import React, { useCallback, useState } from 'react';
import RecentSpacesList from '../recentSpaces/RecentSpacesList';
import LatestContributions from '../latestContributions/LatestContributions';
import MyLatestContributions from '../latestContributions/myLatestContributions/MyLatestContributions';
import { MyMembershipsDialog } from '../myMemberships/MyMembershipsDialog';
import { useLatestContributionsSpacesFlatQuery, useMyMembershipsQuery } from '@/core/apollo/generated/apollo-hooks';
import { useColumns } from '@/core/ui/grid/GridContext';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';
import { useScreenSize } from '@/core/ui/grid/constants';
import { SpaceL0Icon } from '@/domain/space/icons/SpaceL0Icon';

const DashboardActivity = () => {
  const { t } = useTranslation();
  const { isSmallScreen } = useScreenSize();
  const columns = useColumns();

  const [isMyMembershipsDialogOpen, setIsMyMembershipsDialogOpen] = useState(false);
  const { data: spacesData } = useLatestContributionsSpacesFlatQuery();
  const flatSpacesWithMemberships = spacesData?.me.spaceMembershipsFlat.map(membership => membership.space);

  const { data: myMembershipsData, loading: myMembershipsLoading } = useMyMembershipsQuery({
    skip: !isMyMembershipsDialogOpen,
  });

  const blockColumns = isSmallScreen ? columns : columns / 2;

  const renderSpaceActivityBlock = useCallback(
    () => (
      <PageContentColumn key="space-activity" columns={blockColumns}>
        <PageContentBlock>
          <PageContentBlockHeader title={t('pages.home.sections.latestContributions.title')} />
          <LatestContributions limit={10} spaceMemberships={flatSpacesWithMemberships} />
        </PageContentBlock>
      </PageContentColumn>
    ),
    [blockColumns, flatSpacesWithMemberships, t]
  );

  const renderMyActivityBlock = useCallback(
    () => (
      <PageContentColumn key="my-activity" columns={blockColumns}>
        <PageContentBlock>
          <PageContentBlockHeader title={t('pages.home.sections.myLatestContributions.title')} />
          <MyLatestContributions limit={10} spaceMemberships={flatSpacesWithMemberships} />
        </PageContentBlock>
      </PageContentColumn>
    ),
    [blockColumns, flatSpacesWithMemberships, t]
  );

  return (
    <>
      <RecentSpacesList onSeeMore={() => setIsMyMembershipsDialogOpen(true)} />
      {isSmallScreen
        ? [renderMyActivityBlock(), renderSpaceActivityBlock()]
        : [renderSpaceActivityBlock(), renderMyActivityBlock()]}

      <MyMembershipsDialog
        Icon={SpaceL0Icon}
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
