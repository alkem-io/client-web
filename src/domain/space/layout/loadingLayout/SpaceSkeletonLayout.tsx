import SpaceDashboardView from '../tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardView';
import { noop } from 'lodash';

const SpaceSkeletonLayout = () => {
  return (
    <SpaceDashboardView
      space={undefined}
      flowStateForNewCallouts={undefined}
      dashboardNavigation={undefined}
      dashboardNavigationLoading
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
  );
};

export default SpaceSkeletonLayout;
