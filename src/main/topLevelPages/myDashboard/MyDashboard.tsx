import React from 'react';
import HomePageLayout from '../Home/HomePageLayout';
import PageContent from '../../../core/ui/content/PageContent';
import { useLatestContributionsSpacesFlatQuery } from '../../../core/apollo/generated/apollo-hooks';
import Loading from '../../../core/ui/loading/Loading';
import MyDashboardWithMemberships from './MyDashboardWithMemberships';
import MyDashboardWithoutMemberships from './MyDashboardWithoutMemberships';
import { useAuthenticationContext } from '../../../core/auth/authentication/hooks/useAuthenticationContext';
import MyDashboardUnauthenticated from './MyDashboardUnauthenticated';
import { DashboardProvider } from './DashboardContext';

export const MyDashboard = () => {
  const { isAuthenticated, loading: isLoadingAuthentication } = useAuthenticationContext();

  const { data: spacesData, loading: areSpacesLoading } = useLatestContributionsSpacesFlatQuery();
  const hasSpaceMemberships = !!spacesData?.me.spaceMembershipsFlat.length;

  if (areSpacesLoading) {
    return (
      <HomePageLayout>
        <Loading />
      </HomePageLayout>
    );
  }

  return (
    <HomePageLayout>
      <DashboardProvider>
        {!isAuthenticated && !isLoadingAuthentication ? (
          <PageContent>
            <MyDashboardUnauthenticated />
          </PageContent>
        ) : hasSpaceMemberships ? (
          <PageContent>
            <MyDashboardWithMemberships />
          </PageContent>
        ) : (
          <PageContent>
            <MyDashboardWithoutMemberships />
          </PageContent>
        )}
      </DashboardProvider>
    </HomePageLayout>
  );
};

export default MyDashboard;
