import React, { useState } from 'react';
import RecentSpacesList from '../recentSpaces/RecentJourneysList';
import LatestContributions from '../latestContributions/LatestContributions';
import MyLatestContributions from '../latestContributions/myLatestContributions/MyLatestContributions';
import MyMembershipsDialog from '../myMemberships/MyMembershipsDialog';
import { useLatestContributionsSpacesFlatQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useColumns } from '../../../../core/ui/grid/GridContext';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';

const DashboardActivity = () => {
  const { t } = useTranslation();
  const [isMyMembershipsDialogOpen, setIsMyMembershipsDialogOpen] = useState(false);
  const { data: spacesData } = useLatestContributionsSpacesFlatQuery();
  const flatSpacesWithMemberships = spacesData?.me.spaceMembershipsFlat.map(membership => membership.space);

  const columns = useColumns();

  return (
    <>
      <RecentSpacesList onSeeMore={() => setIsMyMembershipsDialogOpen(true)} />
      <PageContentColumn columns={columns / 2}>
        <PageContentBlock>
          <PageContentBlockHeader title={t('pages.home.sections.latestContributions.title')} />
          <LatestContributions spaceMemberships={flatSpacesWithMemberships} />
        </PageContentBlock>
      </PageContentColumn>
      <PageContentColumn columns={columns / 2}>
        <PageContentBlock>
          <PageContentBlockHeader title={t('pages.home.sections.myLatestContributions.title')} />
          <MyLatestContributions spaceMemberships={flatSpacesWithMemberships} />
        </PageContentBlock>
      </PageContentColumn>
      <MyMembershipsDialog open={isMyMembershipsDialogOpen} onClose={() => setIsMyMembershipsDialogOpen(false)} />
    </>
  );
};

export default DashboardActivity;
