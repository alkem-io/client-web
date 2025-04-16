import React, { Suspense } from 'react';
import { useLatestContributionsSpacesFlatQuery } from '@/core/apollo/generated/apollo-hooks';
import Loading from '@/core/ui/loading/Loading';
import { DashboardProvider } from './DashboardContext';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { useCurrentUserContext } from '@/domain/community/user';

const MyDashboardUnauthenticated = lazyWithGlobalErrorHandler(() => import('./MyDashboardUnauthenticated'));
const MyDashboardWithMemberships = lazyWithGlobalErrorHandler(() => import('./MyDashboardWithMemberships'));
const MyDashboardWithoutMemberships = lazyWithGlobalErrorHandler(() => import('./MyDashboardWithoutMemberships'));

export const MyDashboard = () => {
  const { user, isAuthenticated, loading: isLoadingAuthentication } = useCurrentUserContext();
  const hasNotAuthorized = !isAuthenticated || !user;

  const { data: spacesData, loading: areSpacesLoading } = useLatestContributionsSpacesFlatQuery({
    skip: hasNotAuthorized,
  });
  const hasSpaceMemberships = !!spacesData?.me.spaceMembershipsFlat.length;

  if (areSpacesLoading || (isLoadingAuthentication && hasNotAuthorized)) {
    return <Loading />;
  }

  if (!isLoadingAuthentication && hasNotAuthorized) {
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
