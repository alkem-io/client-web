import React, { useState } from 'react';
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
      <MyMembershipsDialog open={isMyMembershipsDialogOpen} onClose={() => setIsMyMembershipsDialogOpen(false)} />
      {!isAuthenticated && !isLoadingAuthentication ? (
        <PageContent gridContainerProps={{ flexDirection: 'row-reverse' }}>
          <MyDashboardUnauthenticated />
        </PageContent>
      ) : hasSpaceMemberships ? (
        <PageContent gridContainerProps={{ flexDirection: 'row-reverse' }}>
          <MyDashboardWithMemberships
            spacesData={spacesData}
            onOpenMembershipsDialog={() => setIsMyMembershipsDialogOpen(true)}
          />
        </PageContent>
      ) : (
        <PageContent gridContainerProps={{ flexDirection: 'row' }}>
          <MyDashboardWithoutMemberships onOpenMembershipsDialog={() => setIsMyMembershipsDialogOpen(true)} />
        </PageContent>
      )}
    </HomePageLayout>
  );
};

export default MyDashboard;
