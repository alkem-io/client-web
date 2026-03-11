import { Suspense, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useLatestContributionsSpacesFlatQuery } from '@/core/apollo/generated/apollo-hooks';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import Loading from '@/core/ui/loading/Loading';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { buildSignUpUrl } from '@/main/routing/urlBuilders';
import { DIALOG_PARAM_VALUES, useMyDashboardDialogs } from '@/main/topLevelPages/myDashboard/useMyDashboardDialogs';
import { DashboardProvider } from './DashboardContext';

const MyDashboardUnauthenticated = lazyWithGlobalErrorHandler(() => import('./MyDashboardUnauthenticated'));
const MyDashboardWithMemberships = lazyWithGlobalErrorHandler(() => import('./MyDashboardWithMemberships'));
const MyDashboardWithoutMemberships = lazyWithGlobalErrorHandler(() => import('./MyDashboardWithoutMemberships'));

export const MyDashboard = () => {
  const { userModel, isAuthenticated, loading: isLoadingAuthentication } = useCurrentUserContext();
  const hasNotAuthorized = !isAuthenticated || !userModel;
  const { pathname, search } = useLocation();
  const [navigateToMemberships, setNavigateToMemberships] = useState(false);

  const { data: spacesData, loading: areSpacesLoading } = useLatestContributionsSpacesFlatQuery({
    skip: hasNotAuthorized,
  });
  const hasSpaceMemberships = !!spacesData?.me.spaceMembershipsFlat.length;

  useMyDashboardDialogs({
    paramValue: DIALOG_PARAM_VALUES.INVITATIONS,
    onDialogOpen: () => setNavigateToMemberships(true),
  });

  if (areSpacesLoading || (isLoadingAuthentication && hasNotAuthorized)) {
    return <Loading />;
  }

  if (!isLoadingAuthentication && hasNotAuthorized) {
    // if navigateToMemberships and user is not authenticated, we need to redirect to the sign up page
    // with the returnUrl as the current location
    if (navigateToMemberships) {
      return <Navigate to={buildSignUpUrl(pathname, search)} />;
    }

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
