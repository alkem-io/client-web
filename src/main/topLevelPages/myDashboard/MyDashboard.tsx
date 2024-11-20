import React, { Suspense } from 'react';
import { useLatestContributionsSpacesFlatQuery } from '../../../core/apollo/generated/apollo-hooks';
import Loading from '../../../core/ui/loading/Loading';
import { useAuthenticationContext } from '../../../core/auth/authentication/hooks/useAuthenticationContext';
import { DashboardProvider } from './DashboardContext';
import { lazyWithGlobalErrorHandler } from '../../../core/lazyLoading/lazyWithGlobalErrorHandler';

const MyDashboardUnauthenticated = lazyWithGlobalErrorHandler(() => import('./MyDashboardUnauthenticated'));
const MyDashboardWithMemberships = lazyWithGlobalErrorHandler(() => import('./MyDashboardWithMemberships'));
const MyDashboardWithoutMemberships = lazyWithGlobalErrorHandler(() => import('./MyDashboardWithoutMemberships'));

export const MyDashboard = () => {
  const { isAuthenticated, loading: isLoadingAuthentication } = useAuthenticationContext();

  const { data: spacesData, loading: areSpacesLoading } = useLatestContributionsSpacesFlatQuery();
  const hasSpaceMemberships = !!spacesData?.me.spaceMembershipsFlat.length;

  if (areSpacesLoading) {
    return <Loading />;
  }

  if (!isAuthenticated && !isLoadingAuthentication) {
    return (
      <Suspense fallback={<Loading />}>
        <MyDashboardUnauthenticated />
      </Suspense>
    );
  }

  if (hasSpaceMemberships) {
    return (
      <Suspense fallback={<Loading />}>
        <DashboardProvider>
          <MyDashboardWithMemberships />
        </DashboardProvider>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <DashboardProvider>
        <MyDashboardWithoutMemberships />
      </DashboardProvider>
    </Suspense>
  );
};

export default MyDashboard;
