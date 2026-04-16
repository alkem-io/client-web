import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import { SpaceContextProvider } from '@/domain/space/context/SpaceContext';
import SubspaceContextProvider from '@/domain/space/context/SubspaceContext';
import { TabbedLayoutParams } from '@/main/routing/urlBuilders';
import { nameOfUrl } from '@/main/routing/urlParams';
import CrdSpacePageLayout from '../layout/CrdSpacePageLayout';
import CrdSpaceProtectedRoutes from './CrdSpaceProtectedRoutes';

const CrdSpaceTabbedPages = lazyWithGlobalErrorHandler(() => import('../tabs/CrdSpaceTabbedPages'));
const CrdSpaceAboutPage = lazyWithGlobalErrorHandler(() => import('../about/CrdSpaceAboutPage'));
const CrdSpaceSettingsPage = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage')
);
const SubspaceRoutes = lazyWithGlobalErrorHandler(() => import('@/domain/space/routing/SubspaceRoutes'));
const SpaceCalloutPage = lazyWithGlobalErrorHandler(() => import('@/domain/space/pages/SpaceCalloutPage'));

export default function CrdSpaceRoutes() {
  return (
    <SpaceContextProvider>
      <Routes>
        <Route path="/" element={<CrdSpacePageLayout />}>
          {/* About is accessible without canRead permission */}
          <Route
            path={EntityPageSection.About}
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <CrdSpaceAboutPage />
              </Suspense>
            }
          />

          {/* Protected routes — require canRead permission */}
          <Route element={<CrdSpaceProtectedRoutes />}>
            <Route
              index={true}
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <CrdSpaceTabbedPages />
                </Suspense>
              }
            />

            <Route
              path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}`}
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <SpaceCalloutPage />
                </Suspense>
              }
            />

            <Route
              path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <SpaceCalloutPage />
                </Suspense>
              }
            />

            <Route
              path={`${EntityPageSection.Settings}/*`}
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <CrdSpaceSettingsPage />
                </Suspense>
              }
            />

            {/* Subspace routes have their own layout */}
            <Route
              path={`/challenges/:${nameOfUrl.subspaceNameId}/*`}
              element={
                <SubspaceContextProvider>
                  <Suspense fallback={<LoadingSpinner />}>
                    <SubspaceRoutes />
                  </Suspense>
                </SubspaceContextProvider>
              }
            />
          </Route>
          {/* Legacy route redirects — old bookmarks/links use path-based sections */}
          <Route
            path={EntityPageSection.Dashboard}
            element={<Navigate to={`../?${TabbedLayoutParams.Section}=1`} replace={true} />}
          />
          <Route
            path={EntityPageSection.Community}
            element={<Navigate to={`../?${TabbedLayoutParams.Section}=2`} replace={true} />}
          />
          <Route
            path={EntityPageSection.Subspaces}
            element={<Navigate to={`../?${TabbedLayoutParams.Section}=3`} replace={true} />}
          />
          <Route
            path={EntityPageSection.KnowledgeBase}
            element={<Navigate to={`../?${TabbedLayoutParams.Section}=4`} replace={true} />}
          />
          <Route
            path={EntityPageSection.Custom}
            element={<Navigate to={`../?${TabbedLayoutParams.Section}=5`} replace={true} />}
          />
          <Route
            path={EntityPageSection.Contribute}
            element={<Navigate to={`../?${TabbedLayoutParams.Section}=1`} replace={true} />}
          />
          <Route path="explore/*" element={<Navigate to={`../?${TabbedLayoutParams.Section}=1`} replace={true} />} />
        </Route>
      </Routes>
    </SpaceContextProvider>
  );
}
