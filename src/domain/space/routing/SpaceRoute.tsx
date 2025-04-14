import { Route, Routes, Navigate, useSearchParams } from 'react-router-dom';
import { nameOfUrl } from '@/main/routing/urlParams';
import { Error404 } from '@/core/pages/Errors/Error404';
import { NotFoundPageLayout } from '@/domain/space/layout/EntityPageLayout';
import CalloutRoute from '@/domain/collaboration/callout/routing/CalloutRoute';
import Redirect from '@/core/routing/Redirect';
import SpaceCalloutPage from '../pages/SpaceCalloutPage';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import React, { PropsWithChildren, Suspense } from 'react';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import SpaceDashboardPage from '../layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardPage';
import { useSpace } from '@/domain/space/context/useSpace';
import SpaceAboutPage from '@/domain/space/about/SpaceAboutPage';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import TabbedLayoutPage, { TabbedLayoutParams } from '../layout/tabbedLayout/TabbedLayoutPage';
import SpaceAdminL0Route from '../../spaceAdmin/routing/SpaceAdminRouteL0';
import SubspaceContextProvider from '../context/SubspaceContext';

const SubspaceRoute = lazyWithGlobalErrorHandler(() => import('@/domain/space/routing/SubspaceRoute'));
const routes = { ...EntityPageSection };

interface RestrictedRouteProps extends PropsWithChildren {
  loading: boolean;
  allowed: boolean;
  redirectUrl: string;
}

const LegacyRoutesRedirects = (spaceNameId: string) => (
  <>
    <Route
      path={EntityPageSection.Dashboard}
      element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=1`} replace />}
    />
    <Route
      path={EntityPageSection.Community}
      element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=2`} replace />}
    />
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
    <Route
      path={EntityPageSection.Updates}
      element={<Navigate to={`/${spaceNameId}/?${TabbedLayoutParams.Section}=1&dialog=updates`} replace />}
    />
    <Route path="explore/*" element={<Redirect to={routes.Contribute} />} />
  </>
);

const RestrictedRoute = ({ loading, allowed, redirectUrl, children }: RestrictedRouteProps) => {
  if (loading) {
    // Careful returning <Loading /> here, react-router ads it to the layout without removing the previous one
    return undefined;
  }
  if (!allowed) {
    if (redirectUrl) {
      const url = new URL(redirectUrl).pathname;
      return <Navigate to={url} replace />;
    } else {
      // Wait for the next render, this url needs to be defined, but don't throw an exception because we may be just loading it
      return undefined;
    }
  }
  return <>{children}</>;
};

const SpaceTabbedLayoutRoute = () => {
  const { loading: resolvingUrl } = useUrlResolver();

  const { space, permissions, loading: loadingSpace } = useSpace();

  const [params] = useSearchParams();
  const section = params.get(TabbedLayoutParams.Section) ?? undefined; // avoid nulls here for typescript
  const dialog = params.get(TabbedLayoutParams.Dialog) ?? undefined;

  const loading = resolvingUrl || loadingSpace;

  return (
    <Routes>
      <Route path={routes.About} element={<SpaceAboutPage />} />
      <Route
        path="*"
        element={
          <RestrictedRoute
            loading={loading}
            allowed={permissions.canRead}
            redirectUrl={`${space.about.profile.url}/${routes.About}`}
          >
            <Routes>
              {LegacyRoutesRedirects(space.nameID)}
              <Route index element={<TabbedLayoutPage sectionNumber={section} dialog={dialog} />} />
              <Route path={routes.About} element={<TabbedLayoutPage sectionNumber={undefined} dialog="about" />} />
              <Route path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}`} element={<SpaceCalloutPage />} />
              <Route
                path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
                element={<SpaceCalloutPage>{props => <CalloutRoute {...props} />}</SpaceCalloutPage>}
              />
              <Route path="calendar" element={<TabbedLayoutPage sectionNumber={'1'} dialog="calendar" />} />
              <Route
                path={`calendar/:${nameOfUrl.calendarEventNameId}`}
                element={<SpaceDashboardPage dialog="calendar" />}
              />
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
                path="*"
                element={
                  <NotFoundPageLayout>
                    <Error404 />
                  </NotFoundPageLayout>
                }
              />
            </Routes>
          </RestrictedRoute>
        }
      />
    </Routes>
  );
};

export default SpaceTabbedLayoutRoute;
