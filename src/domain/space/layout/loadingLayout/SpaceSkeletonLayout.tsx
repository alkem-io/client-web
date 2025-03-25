import SpacePageLayout from '@/domain/space/layout/tabbedLayout/layout/SpacePageLayout';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import SpaceDashboardView from '../tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardView';
import { noop } from 'lodash';

const SpaceSkeletonLayout = () => {
  return (
    <SpacePageLayout journeyPath={undefined} currentSection={EntityPageSection.About} loading>
      <SpaceDashboardView
        space={undefined}
        flowStateForNewCallouts={undefined}
        dashboardNavigation={undefined}
        dashboardNavigationLoading
        loading
        entityReadAccess={false}
        readUsersAccess={false}
        shareUpdatesUrl={''}
        calloutsSetProvided={{
          calloutsSetId: undefined,
          callouts: undefined,
          canCreateCallout: false,
          loading: true,
          refetchCallouts: noop,
          refetchCallout: noop,
          onCalloutsSortOrderUpdate: () => () => Promise.resolve(),
        }}
      />
    </SpacePageLayout>
  );
};

export default SpaceSkeletonLayout;
