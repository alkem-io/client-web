import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import Loading from '@/core/ui/loading/Loading';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { SpaceContextProvider } from '@/domain/space/context/SpaceContext';
import SubspaceContextProvider from '@/domain/space/context/SubspaceContext';
import { nameOfUrl } from '@/main/routing/urlParams';
import CrdSpacePageLayout from '../layout/CrdSpacePageLayout';

const CrdSpaceTabbedPages = lazyWithGlobalErrorHandler(() => import('../tabs/CrdSpaceTabbedPages'));
const CrdSpaceAboutPage = lazyWithGlobalErrorHandler(() => import('../about/CrdSpaceAboutPage'));
const SpaceAdminL0Route = lazyWithGlobalErrorHandler(() => import('@/domain/spaceAdmin/routing/SpaceAdminRouteL0'));
const SubspaceRoutes = lazyWithGlobalErrorHandler(() => import('@/domain/space/routing/SubspaceRoutes'));
const SpaceCalloutPage = lazyWithGlobalErrorHandler(() => import('@/domain/space/pages/SpaceCalloutPage'));

export default function CrdSpaceRoutes() {
  return (
    <SpaceContextProvider>
      <Routes>
        <Route path="/" element={<CrdSpacePageLayout />}>
          <Route
            path={EntityPageSection.About}
            element={
              <Suspense fallback={<Loading />}>
                <CrdSpaceAboutPage />
              </Suspense>
            }
          />

          {/* Protected routes — permission check happens in CrdSpacePageLayout */}
          <Route
            index={true}
            element={
              <Suspense fallback={<Loading />}>
                <CrdSpaceTabbedPages />
              </Suspense>
            }
          />

          <Route
            path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}`}
            element={
              <Suspense fallback={<Loading />}>
                <SpaceCalloutPage />
              </Suspense>
            }
          />

          <Route
            path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
            element={
              <Suspense fallback={<Loading />}>
                <SpaceCalloutPage />
              </Suspense>
            }
          />

          <Route
            path={`${EntityPageSection.Settings}/*`}
            element={
              <Suspense fallback={<Loading />}>
                <SpaceAdminL0Route />
              </Suspense>
            }
          />

          {/* Subspace routes have their own layout */}
          <Route
            path={`/challenges/:${nameOfUrl.subspaceNameId}/*`}
            element={
              <SubspaceContextProvider>
                <Suspense fallback={<Loading />}>
                  <SubspaceRoutes />
                </Suspense>
              </SubspaceContextProvider>
            }
          />
        </Route>
      </Routes>
    </SpaceContextProvider>
  );
}
