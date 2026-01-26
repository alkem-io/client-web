import React, { Suspense, useState } from 'react';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import ReleaseNotesBanner from './releaseNotesBanner/ReleaseNotesBanner';
import { useLatestReleaseDiscussionQuery } from '@/core/apollo/generated/apollo-hooks';
import CampaignBlock from './Campaigns/CampaignBlock';
import InfoColumn from '@/core/ui/content/InfoColumn';
import { DashboardMenu } from './DashboardMenu/DashboardMenu';
import ContentColumn from '@/core/ui/content/ContentColumn';
import { useDashboardContext } from './DashboardContext';
import MyResources from './myResources/MyResources';
import { useScreenSize } from '@/core/ui/grid/constants';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import Loading from '@/core/ui/loading/Loading';
import RecentSpacesList from './recentSpaces/RecentSpacesList';
import { MyMembershipsDialog } from './myMemberships/MyMembershipsDialog';
import { useMyMembershipsQuery } from '@/core/apollo/generated/apollo-hooks';
import { SpaceL0Icon } from '@/domain/space/icons/SpaceL0Icon';
import { useTranslation } from 'react-i18next';

const DashboardDialogs = lazyWithGlobalErrorHandler(() => import('./DashboardDialogs/DashboardDialogs'));
const DashboardActivity = lazyWithGlobalErrorHandler(() => import('./DashboardWithMemberships/DashboardActivity'));
const DashboardSpaces = lazyWithGlobalErrorHandler(
  () => import('./DashboardWithMemberships/DashboardSpaces/DashboardSpaces')
);

const MyDashboardWithMemberships = () => {
  const { t } = useTranslation();
  const { activityEnabled } = useDashboardContext();
  const { data } = useLatestReleaseDiscussionQuery({
    fetchPolicy: 'network-only',
  });

  const { isMediumSmallScreen } = useScreenSize();

  const [isMyMembershipsDialogOpen, setIsMyMembershipsDialogOpen] = useState(false);
  const { data: myMembershipsData, loading: myMembershipsLoading } = useMyMembershipsQuery({
    skip: !isMyMembershipsDialogOpen,
  });

  return (
    <PageContentColumn columns={12}>
      {activityEnabled && (
        <PageContentColumn columns={12}>
          <RecentSpacesList onSeeMore={() => setIsMyMembershipsDialogOpen(true)} />
        </PageContentColumn>
      )}
      {!isMediumSmallScreen && (
        <InfoColumn>
          <DashboardMenu />
          <MyResources />
        </InfoColumn>
      )}
      <ContentColumn fullWidth>
        {isMediumSmallScreen && <DashboardMenu expandable />}
        {data?.platform.latestReleaseDiscussion && <ReleaseNotesBanner />}
        <CampaignBlock />
        {!activityEnabled && (
          <Suspense fallback={<Loading />}>
            <DashboardSpaces />
          </Suspense>
        )}
        {activityEnabled && (
          <Suspense fallback={<Loading />}>
            <DashboardActivity />
          </Suspense>
        )}
      </ContentColumn>
      <Suspense fallback={<Loading />}>
        <DashboardDialogs />
      </Suspense>
      <MyMembershipsDialog
        Icon={SpaceL0Icon}
        loading={myMembershipsLoading}
        open={isMyMembershipsDialogOpen}
        title={t('pages.home.sections.myMemberships.title')}
        data={myMembershipsData?.me?.spaceMembershipsHierarchical ?? []}
        onClose={() => setIsMyMembershipsDialogOpen(false)}
      />
    </PageContentColumn>
  );
};

export default MyDashboardWithMemberships;
