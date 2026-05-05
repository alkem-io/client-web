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

const CrdSpaceAboutPage = lazyWithGlobalErrorHandler(() => import('@/main/crdPages/space/about/CrdSpaceAboutPage'));
const CrdSpaceSettingsPage = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage')
);
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
        <Route index={true} element={<CrdSubspaceCalloutsPage />} />
        <Route
          path={EntityPageSection.About}
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <CrdSpaceAboutPage />
            </Suspense>
          }
        />
        <Route path={`${EntityPageSection.Settings}/*`} element={<CrdSubspaceSettingsRoute />} />
      </Route>

      {/*
        L2 — /opportunities/:subsubspaceNameId. Re-uses the same layout; SubspaceContextProvider
        (mounted in CrdSpaceRoutes) re-resolves to the deeper space via useUrlResolver when the
        subsubspaceNameId param appears in the URL.
      */}
      <Route path={`opportunities/:${nameOfUrl.subsubspaceNameId}`} element={<CrdSubspacePageLayout />}>
        <Route index={true} element={<CrdSubspaceCalloutsPage />} />
        <Route
          path={EntityPageSection.About}
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <CrdSpaceAboutPage />
            </Suspense>
          }
        />
        <Route path={`${EntityPageSection.Settings}/*`} element={<CrdSubspaceSettingsRoute />} />
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
