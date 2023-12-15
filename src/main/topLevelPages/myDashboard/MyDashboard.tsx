import React, { useState } from 'react';
import ReleaseUpdatesDialog from '../../../domain/platform/notifications/ReleaseUpdates/ReleaseUpdatesDialog';
import HomePageLayout from '../Home/HomePageLayout';
import PageContent from '../../../core/ui/content/PageContent';
import MyMembershipsDialog from './myMemberships/MyMembershipsDialog';
import { useLatestContributionsSpacesQuery } from '../../../core/apollo/generated/apollo-hooks';
import Loading from '../../../core/ui/loading/Loading';
import MyDashboardWithMemberships from './MyDashboardWithMemberships';
import MyDashboardWithoutMemberships from './MyDashboardWithoutMemberships';
import { useAuthenticationContext } from '../../../core/auth/authentication/hooks/useAuthenticationContext';
import MyDashboardUnauthenticated from './MyDashboardUnauthenticated';

export const MyDashboard = () => {
  const { isAuthenticated, loading: isLoadingAuthentication } = useAuthenticationContext();
  const [isMyMembershipsDialogOpen, setIsMyMembershipsDialogOpen] = useState(false);

  const { data: spacesData, loading: areSpacesLoading } = useLatestContributionsSpacesQuery();
  const hasSpaceMemberships = !!spacesData?.me.spaceMemberships.length;

  if (areSpacesLoading) {
    return (
      <HomePageLayout>
        <Loading />
      </HomePageLayout>
    );
  }

  return (
    <HomePageLayout>
      <ReleaseUpdatesDialog />
      <MyMembershipsDialog open={isMyMembershipsDialogOpen} onClose={() => setIsMyMembershipsDialogOpen(false)} />
      <PageContent gridContainerProps={{ flexDirection: 'row-reverse' }}>
        {!isAuthenticated && !isLoadingAuthentication ? (
          <MyDashboardUnauthenticated />
        ) : hasSpaceMemberships ? (
          <MyDashboardWithMemberships
            spacesData={spacesData}
            onOpenMembershipsDialog={() => setIsMyMembershipsDialogOpen(true)}
          />
        ) : (
          <MyDashboardWithoutMemberships onOpenMembershipsDialog={() => setIsMyMembershipsDialogOpen(true)} />
        )}
      </PageContent>
    </HomePageLayout>
  );
};

export default MyDashboard;
