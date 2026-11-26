import { Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useV2DashboardMembershipProbeQuery } from '@/core/apollo/generated-v2/apollo-hooks';
import { useReportedQueryError } from '@/core/apollo/hooks/useReportedQueryError';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import Loading from '@/core/ui/loading/Loading';
import {
  PendingMembershipsDialogProvider,
  PendingMembershipsDialogType,
  usePendingMembershipsDialog,
} from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { buildSignUpUrl } from '@/main/routing/urlBuilders';
import { useDashboardDialogs } from './useDashboardDialogs';

const DashboardUnauthenticated = lazyWithGlobalErrorHandler(() => import('./DashboardUnauthenticated'));
const DashboardWithMemberships = lazyWithGlobalErrorHandler(() => import('./DashboardWithMemberships'));
const DashboardWithoutMemberships = lazyWithGlobalErrorHandler(() => import('./DashboardWithoutMemberships'));
const CrdPendingMembershipsDialog = lazyWithGlobalErrorHandler(() => import('./CrdPendingMembershipsDialog'));

/**
 * The pending-memberships dialog and its context, mounted at the shell in fed85 (root.tsx:116, CrdLayoutWrapper.tsx:33,
 * :131), are mounted with the dashboard that opens them (sidebar invitations, `?dialog=invitations`).
 */
export default function DashboardPage() {
  return (
    <PendingMembershipsDialogProvider>
      <DashboardContent />
      <Suspense fallback={null}>
        <CrdPendingMembershipsDialog />
      </Suspense>
    </PendingMembershipsDialogProvider>
  );
}

function DashboardContent() {
  const { userModel, isAuthenticated, loading: isLoadingAuthentication } = useCurrentUserContext();
  const hasNotAuthorized = !isAuthenticated || !userModel;
  const { pathname, search } = useLocation();
  const wantsInvitations = new URLSearchParams(search).get('dialog') === 'invitations';
  const { setOpenDialog: setOpenPendingDialog } = usePendingMembershipsDialog();
  const openPendingMembershipsDialog = () =>
    setOpenPendingDialog({ type: PendingMembershipsDialogType.PendingMembershipsList });

  const {
    data: spacesData,
    loading: areSpacesLoading,
    error: spacesError,
  } = useV2DashboardMembershipProbeQuery({
    skip: hasNotAuthorized,
  });
  useReportedQueryError(spacesError);
  const hasSpaceMemberships = !!spacesData?.spaces.edges.length;

  // Only act on `dialog=invitations` once the user is authenticated — otherwise the
  // logged-out redirect below owns that case and must keep the param intact.
  const dialogState = useDashboardDialogs({
    onPendingMembershipsClick: () => openPendingMembershipsDialog(),
    enabled: !hasNotAuthorized,
  });

  if (areSpacesLoading || (isLoadingAuthentication && hasNotAuthorized)) {
    return <Loading />;
  }

  if (!isLoadingAuthentication && hasNotAuthorized) {
    // A logged-out visitor following an external-invite link (`/home?dialog=invitations`)
    // is sent to sign-up with the current URL preserved as the returnUrl, so they land
    // back on the invitations dialog after registering (parity with MUI `MyDashboard`).
    if (wantsInvitations) {
      return <Navigate to={buildSignUpUrl(pathname, search)} replace={true} />;
    }

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
