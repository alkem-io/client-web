import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import NonSpaceAdminRedirect from '@/domain/spaceAdmin/routing/NonSpaceAdminRedirect';
import { nameOfUrl } from '@/main/routing/urlParams';
import CrdSubspacePageLayout from '../layout/CrdSubspacePageLayout';
import CrdSubspaceCalloutsPage from '../tabs/CrdSubspaceCalloutsPage';
import CrdSubspaceProtectedRoutes from './CrdSubspaceProtectedRoutes';

const CrdSubspaceAboutPage = lazyWithGlobalErrorHandler(() => import('../about/CrdSubspaceAboutPage'));
const CrdSpaceSettingsPage = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage')
);
const CrdSubspaceCalloutPage = lazyWithGlobalErrorHandler(() => import('../CrdSubspaceCalloutPage'));
const LegacySubspaceRoutes = lazyWithGlobalErrorHandler(() => import('@/domain/space/routing/SubspaceRoutes'));

/**
 * Wraps the subspace settings page with the same admin-redirect gate the
 * legacy MUI L1/L2 routes use, sourcing the subspace id from `SubspaceContext`.
 */
function CrdSubspaceSettingsRoute() {
  const { subspace } = useSubSpace();
  return (
    <NonSpaceAdminRedirect spaceId={subspace?.id || undefined}>
      <Suspense fallback={<LoadingSpinner />}>
        <CrdSpaceSettingsPage />
      </Suspense>
    </NonSpaceAdminRedirect>
  );
}

export default function CrdSubspaceRoutes() {
  return (
    <Routes>
      {/* L1 — /space/:spaceNameId/challenges/:subspaceNameId */}
      <Route element={<CrdSubspacePageLayout />}>
        {/* About is accessible without canRead permission */}
        <Route
          path={EntityPageSection.About}
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <CrdSubspaceAboutPage />
            </Suspense>
          }
        />

        {/* Protected routes — require canRead permission */}
        <Route element={<CrdSubspaceProtectedRoutes />}>
          <Route index={true} element={<CrdSubspaceCalloutsPage />} />
          <Route path={`${EntityPageSection.Settings}/*`} element={<CrdSubspaceSettingsRoute />} />
          {/* Calendar dialog routes — render the callouts page so the URL resolver
              populates calendarEventId; the dialog opens on top via
              CrdSubspaceEventsDialogConnector mounted in CrdSubspacePageLayout. */}
          <Route path="calendar" element={<CrdSubspaceCalloutsPage />} />
          <Route path={`calendar/:${nameOfUrl.calendarEventNameId}`} element={<CrdSubspaceCalloutsPage />} />
          {/* Deep-link to a callout / contribution under the subspace renders the
              same callouts page behind the CRD callout-detail dialog. */}
          <Route
            path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}`}
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <CrdSubspaceCalloutPage />
              </Suspense>
            }
          />
          <Route
            path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <CrdSubspaceCalloutPage />
              </Suspense>
            }
          />
        </Route>
      </Route>

      {/*
        L2 — /opportunities/:subsubspaceNameId. Re-uses the same layout; SubspaceContextProvider
        (mounted in CrdSpaceRoutes) re-resolves to the deeper space via useUrlResolver when the
        subsubspaceNameId param appears in the URL.
      */}
      <Route path={`opportunities/:${nameOfUrl.subsubspaceNameId}`} element={<CrdSubspacePageLayout />}>
        {/* About is accessible without canRead permission */}
        <Route
          path={EntityPageSection.About}
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <CrdSubspaceAboutPage />
            </Suspense>
          }
        />

        {/* Protected routes — require canRead permission */}
        <Route element={<CrdSubspaceProtectedRoutes />}>
          <Route index={true} element={<CrdSubspaceCalloutsPage />} />
          <Route path={`${EntityPageSection.Settings}/*`} element={<CrdSubspaceSettingsRoute />} />
          <Route path="calendar" element={<CrdSubspaceCalloutsPage />} />
          <Route path={`calendar/:${nameOfUrl.calendarEventNameId}`} element={<CrdSubspaceCalloutsPage />} />
          <Route
            path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}`}
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <CrdSubspaceCalloutPage />
              </Suspense>
            }
          />
          <Route
            path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <CrdSubspaceCalloutPage />
              </Suspense>
            }
          />
        </Route>
      </Route>

      {/* Fall-through: legacy MUI subspace routes (calendar, callout details). */}
      <Route
        path="*"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <LegacySubspaceRoutes />
          </Suspense>
        }
      />
    </Routes>
  );
}
