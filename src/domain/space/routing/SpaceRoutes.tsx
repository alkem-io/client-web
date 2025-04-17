import { Route, Routes, Navigate, useSearchParams, Outlet } from 'react-router-dom';
import { nameOfUrl } from '@/main/routing/urlParams';
import { Error404 } from '@/core/pages/Errors/Error404';
import { NotFoundPageLayout } from '@/domain/space/layout/EntityPageLayout';
import CalloutRoute from '@/domain/collaboration/callout/routing/CalloutRoute';
import Redirect from '@/core/routing/Redirect';
import SpaceCalloutPage from '../pages/SpaceCalloutPage';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import React, { PropsWithChildren, Suspense, useContext } from 'react';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import SpaceDashboardPage from '../layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardPage';
import { useSpace } from '@/domain/space/context/useSpace';
import SpaceAboutPage from '@/domain/space/about/SpaceAboutPage';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import TabbedLayoutPage, { TabbedLayoutParams } from '../layout/tabbedLayout/TabbedLayoutPage';
import SpaceAdminL0Route from '../../spaceAdmin/routing/SpaceAdminRouteL0';
import SubspaceContextProvider from '../context/SubspaceContext';
import { SpaceContext, SpaceContextProvider } from '../context/SpaceContext';
// import SpacePageLayout from '../layout/tabbedLayout/layout/SpacePageLayout';
import { SpacePageLayout } from '../layout/SpacePageLayout';
import SpaceCommunityPage from '../layout/tabbedLayout/Tabs/SpaceCommunityPage/SpaceCommunityPage';
import SpaceSubspacesPage from '../layout/tabbedLayout/Tabs/SpaceSubspacesPage';
import SpaceKnowledgeBasePage from '../layout/tabbedLayout/Tabs/SpaceKnowledgeBase/SpaceKnowledgeBasePage';

const SubspaceRoute = lazyWithGlobalErrorHandler(() => import('@/domain/space/routing/SubspaceRoutes'));
const routes = { ...EntityPageSection };

interface RestrictedRouteProps extends PropsWithChildren {
  allowed: boolean;
}

const LegacyRoutesRedirects = ({ spaceNameId }: { spaceNameId: string }) => (
  <>
    <Route
      path={EntityPageSection.Dashboard}
      element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=1`} replace />}
    />
    path={EntityPageSection.Community}
    <Route element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=2`} replace />} />
    <Route
      path={EntityPageSection.Subspaces}
      element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=3`} replace />}
    />
    <Route
      path={EntityPageSection.KnowledgeBase}
      element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=4`} replace />}
    />
    <Route
      path={EntityPageSection.Custom}
      element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=5`} replace />}
    />
    <Route
      path={EntityPageSection.Contribute}
      element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=1`} replace />}
    />
    <Route path="explore/*" element={<Redirect to={routes.Contribute} />} />
  </>
);

// const SpaceProtectedRoutes = ({ allowed, redirectUrl, children }: RestrictedRouteProps) => {
//   if (!allowed) {
//     if (redirectUrl) {
//       const url = new URL(redirectUrl).pathname;
//       return <Navigate to={url} replace />;
//     } else {
//       // Wait for the next render, this url needs to be defined, but don't throw an exception because we may be just loading it
//       return undefined;
//     }
//   }
//   return <>{children}</>;
// };

const SpaceProtectedRoutes = () => {
  const { loading: resolvingUrl } = useUrlResolver();
  const { space, permissions, loading: loadingSpace } = useContext(SpaceContext);
  const [params] = useSearchParams();
  // const section = params.get(TabbedLayoutParams.Section) ?? undefined; // avoid nulls here for typescript
  // const dialog = params.get(TabbedLayoutParams.Dialog) ?? undefined;

  console.log({ space, permissions, loadingSpace });
  if (resolvingUrl || loadingSpace) {
    return null;
  }

  if (!permissions.canRead) {
    return <Navigate to={`${space.about.profile.url}/${routes.About}`} replace />;
  }

  return <Outlet />;
  return (
    <>
      {/* <> */}
      {/*   <LegacyRoutesRedirects spaceNameId={space.nameID} /> */}
      {/* </> */}
      {/* <Route index element={<TabbedLayoutPage sectionNumber={section} dialog={dialog} />} /> */}
      {/* <Route index path={routes.Dashboard} element={<SpaceDashboardPage dialog={undefined} />} /> */}
      {/* <Route path={`/${routes.Community}`} element={<SpaceCommunityPage />} /> */}
      {/* <Route path={routes.Subspaces} element={<SpaceSubspacesPage />} /> */}
      {/* <Route path={routes.KnowledgeBase} element={<SpaceKnowledgeBasePage sectionIndex={2} />} /> */}
      {/* <Route path="dashboard" element={<SpaceDashboardPage dialog={undefined} />} /> */}
      {/* <Route path={routes.About} element={<TabbedLayoutPage sectionNumber={undefined} dialog="about" />} /> */}

      {/* <Route path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}`} element={<SpaceCalloutPage />} /> */}
      {/* <Route */}
      {/*   path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}/*`} */}
      {/*   element={<SpaceCalloutPage>{props => <CalloutRoute {...props} />}</SpaceCalloutPage>} */}
      {/* /> */}
      {/* <Route path="calendar" element={<TabbedLayoutPage sectionNumber={'1'} dialog="calendar" />} /> */}
      {/* <Route path={`calendar/:${nameOfUrl.calendarEventNameId}`} element={<SpaceDashboardPage dialog="calendar" />} /> */}
      {/* <Route path={`${routes.Settings}/*`} element={<SpaceAdminL0Route />} /> */}
      {/* <Route */}
      {/*   path={`challenges/:${nameOfUrl.subspaceNameId}/*`} */}
      {/*   element={ */}
      {/*     <SubspaceContextProvider> */}
      {/*       <Suspense fallback={null}> */}
      {/*         <SubspaceRoute /> */}
      {/*       </Suspense> */}
      {/*     </SubspaceContextProvider> */}
      {/*   } */}
      {/* /> */}
      {/* <Route */}
      {/*   path="*" */}
      {/*   element={ */}
      {/*     <NotFoundPageLayout> */}
      {/*       <Error404 /> */}
      {/*     </NotFoundPageLayout> */}
      {/*   } */}
      {/* /> */}
    </>
  );
};

// {/* <Routes> */}
// {// {/* </Routes> */}
const SpaceRoutes = () => {
  const [searchParams] = useSearchParams();
  const sectionIndex = searchParams.get(TabbedLayoutParams.Section) ?? '1';
  // not ideal but at least all routing is in one place ^^
  const getSpaceSection = () => {
    switch (sectionIndex) {
      case '1':
        return <SpaceDashboardPage />;
      case '2':
        return <SpaceCommunityPage />;
      case '3':
        return <SpaceSubspacesPage />;
      case '4':
        return <SpaceKnowledgeBasePage sectionIndex={3} />;
    }
  };
  return (
    <SpaceContextProvider>
      <Routes>
        {/* keep the logic around sections in one place - here*/}
        <Route path="/" element={<SpacePageLayout sectionIndex={parseInt(sectionIndex) - 1} />}>
          <Route path={routes.About} element={<SpaceAboutPage />} />
          <Route element={<SpaceProtectedRoutes />}>
            <Route index element={getSpaceSection()} />
            <Route path={`${routes.Settings}/*`} element={<SpaceAdminL0Route />} />
            <Route
              path={`challenges/:${nameOfUrl.subspaceNameId}/*`}
              element={
                <SubspaceContextProvider>
                  <Suspense fallback={null}>
                    <SubspaceRoute />
                  </Suspense>
                </SubspaceContextProvider>
              }
            />

            <Route
              path={`calendar/:${nameOfUrl.calendarEventNameId}?`}
              element={<SpaceDashboardPage dialog="calendar" />}
            />
          </Route>
        </Route>
      </Routes>
    </SpaceContextProvider>
  );
};

export default SpaceRoutes;
