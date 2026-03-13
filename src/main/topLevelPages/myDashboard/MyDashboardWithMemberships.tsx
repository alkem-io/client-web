import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLatestReleaseDiscussionQuery, useMyMembershipsQuery } from '@/core/apollo/generated/apollo-hooks';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import ContentColumn from '@/core/ui/content/ContentColumn';
import InfoColumn from '@/core/ui/content/InfoColumn';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import { useScreenSize } from '@/core/ui/grid/constants';
import Loading from '@/core/ui/loading/Loading';
import { SpaceL0Icon } from '@/domain/space/icons/SpaceL0Icon';
import CampaignBlock from './Campaigns/CampaignBlock';
import { useDashboardContext } from './DashboardContext';
import { DashboardMenu } from './DashboardMenu/DashboardMenu';
import { MyMembershipsDialog } from './myMemberships/MyMembershipsDialog';
import MyResources from './myResources/MyResources';
import RecentSpacesList from './recentSpaces/RecentSpacesList';
import ReleaseNotesBanner from './releaseNotesBanner/ReleaseNotesBanner';

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
      <ContentColumn fullWidth={true}>
        {isMediumSmallScreen && <DashboardMenu expandable={true} />}
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
