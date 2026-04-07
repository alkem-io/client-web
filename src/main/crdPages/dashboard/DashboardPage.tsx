import { Suspense } from 'react';
import { useLatestContributionsSpacesFlatQuery } from '@/core/apollo/generated/apollo-hooks';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import Loading from '@/core/ui/loading/Loading';
import {
  PendingMembershipsDialogType,
  usePendingMembershipsDialog,
} from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useDashboardDialogs } from './useDashboardDialogs';

const DashboardUnauthenticated = lazyWithGlobalErrorHandler(() => import('./DashboardUnauthenticated'));
const DashboardWithMemberships = lazyWithGlobalErrorHandler(() => import('./DashboardWithMemberships'));
const DashboardWithoutMemberships = lazyWithGlobalErrorHandler(() => import('./DashboardWithoutMemberships'));

export default function DashboardPage() {
  const { userModel, isAuthenticated, loading: isLoadingAuthentication } = useCurrentUserContext();
  const hasNotAuthorized = !isAuthenticated || !userModel;
  const { setOpenDialog: setOpenPendingDialog } = usePendingMembershipsDialog();
  const openPendingMembershipsDialog = () =>
    setOpenPendingDialog({ type: PendingMembershipsDialogType.PendingMembershipsList });

  const { data: spacesData, loading: areSpacesLoading } = useLatestContributionsSpacesFlatQuery({
    skip: hasNotAuthorized,
  });
  const hasSpaceMemberships = !!spacesData?.me.spaceMembershipsFlat.length;

  const dialogState = useDashboardDialogs({
    onPendingMembershipsClick: () => openPendingMembershipsDialog(),
  });

  if (areSpacesLoading || (isLoadingAuthentication && hasNotAuthorized)) {
    return <Loading />;
  }

  if (!isLoadingAuthentication && hasNotAuthorized) {
    return (
      <Suspense fallback={<Loading />}>
        <DashboardUnauthenticated />
      </Suspense>
    );
  }

  if (hasSpaceMemberships) {
    return (
      <Suspense fallback={<Loading />}>
        <DashboardWithMemberships
          dialogState={dialogState}
          onPendingMembershipsClick={() => openPendingMembershipsDialog()}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <DashboardWithoutMemberships
        dialogState={dialogState}
        onPendingMembershipsClick={() => openPendingMembershipsDialog()}
      />
    </Suspense>
  );
}
