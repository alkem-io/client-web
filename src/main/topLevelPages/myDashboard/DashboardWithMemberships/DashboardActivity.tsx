import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLatestContributionsSpacesFlatQuery } from '@/core/apollo/generated/apollo-hooks';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import { useScreenSize } from '@/core/ui/grid/constants';
import { useColumns } from '@/core/ui/grid/GridContext';
import LatestContributions from '../latestContributions/LatestContributions';
import MyLatestContributions from '../latestContributions/myLatestContributions/MyLatestContributions';

const DashboardActivity = () => {
  const { t } = useTranslation();
  const { isSmallScreen } = useScreenSize();
  const columns = useColumns();

  const { data: spacesData } = useLatestContributionsSpacesFlatQuery();
  const flatSpacesWithMemberships = spacesData?.me.spaceMembershipsFlat.map(membership => membership.space);

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
      {isSmallScreen
        ? [renderMyActivityBlock(), renderSpaceActivityBlock()]
        : [renderSpaceActivityBlock(), renderMyActivityBlock()]}
    </>
  );
};

export default DashboardActivity;
