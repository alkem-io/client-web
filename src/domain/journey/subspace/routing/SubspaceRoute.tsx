import React, { useMemo } from 'react';
import { Route, Routes } from 'react-router';
import { Navigate } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import { nameOfUrl } from '@/main/routing/urlParams';
import SubspaceProvider from '../context/SubspaceProvider';
import { NotFoundPageLayout } from '@/domain/journey/common/EntityPageLayout';
import { routes } from './challengeRoutes';
import CalloutRoute from '@/domain/collaboration/callout/routing/CalloutRoute';
import SubspaceAboutPage from '../../../space/about/SubspaceAboutPage';
import SubspaceHomePage from '../../../space/layout/SubspaceFlow/SubspaceHomePage';
import Redirect from '@/core/routing/Redirect';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import SubspaceCalloutPage from '../subspaceCalloutPage/SubspaceCalloutPage';
import { SubspaceDialog } from '../layout/SubspaceDialog';
import SubspaceSettingsRoute from './settings/SubspaceSettingsRoute';
import { useSubSpace } from '@/domain/journey/subspace/hooks/useSubSpace';
import ProtectedRoute from '@/domain/space/routing/ProtectedRoute';

const SubspaceRoute = () => {
  const { subspace, permissions, loading } = useSubSpace();

  const { spaceId } = useMemo(() => {
    return {
      spaceId: subspace?.id,
    };
  }, [subspace?.id]);

  if (loading || !subspace?.id) {
    return null;
  }

  return (
    <StorageConfigContextProvider locationType="journey" spaceId={spaceId}>
      <Routes>
        <Route path={routes.About} element={<SubspaceAboutPage />} />
        <Route element={<ProtectedRoute canActivate={permissions.canRead} redirectPath={routes.About} />}>
          <Route index element={<SubspaceHomePage />} />
          <Route path={SubspaceDialog.Index} element={<SubspaceHomePage dialog={SubspaceDialog.Index} />} />
          <Route path={SubspaceDialog.Outline} element={<SubspaceHomePage dialog={SubspaceDialog.Outline} />} />
          <Route path={SubspaceDialog.Subspaces} element={<SubspaceHomePage dialog={SubspaceDialog.Subspaces} />} />
          <Route
            path={SubspaceDialog.Contributors}
            element={<SubspaceHomePage dialog={SubspaceDialog.Contributors} />}
          />
          <Route path={SubspaceDialog.Activity} element={<SubspaceHomePage dialog={SubspaceDialog.Activity} />} />
          <Route path={SubspaceDialog.Timeline} element={<SubspaceHomePage dialog={SubspaceDialog.Timeline} />} />
          <Route path={SubspaceDialog.Share} element={<SubspaceHomePage dialog={SubspaceDialog.Share} />} />
          <Route path={SubspaceDialog.ManageFlow} element={<SubspaceHomePage dialog={SubspaceDialog.ManageFlow} />} />
          <Route path={SubspaceDialog.About} element={<SubspaceAboutPage />} />
          <Route path={SubspaceDialog.Updates} element={<SubspaceHomePage dialog={SubspaceDialog.Updates} />} />
          <Route
            path={`${SubspaceDialog.Timeline}/:${nameOfUrl.calendarEventNameId}`}
            element={<SubspaceHomePage dialog={SubspaceDialog.Timeline} />}
          />
          {/* Redirecting legacy dashboard links to Subspace Home */}
          <Route path={routes.Dashboard} element={<Navigate replace to="/" />} />
          <Route path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}`} element={<SubspaceCalloutPage />} />
          <Route
            path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
            element={<SubspaceCalloutPage>{props => <CalloutRoute {...props} />}</SubspaceCalloutPage>}
          />
          <Route path={`${SubspaceDialog.Settings}/*`} element={<SubspaceSettingsRoute />} />
          <Route
            path="*"
            element={
              <NotFoundPageLayout>
                <Error404 />
              </NotFoundPageLayout>
            }
          />
          <Route
            path={`opportunities/:${nameOfUrl.subsubspaceNameId}/*`}
            element={
              <SubspaceProvider>
                <SubspaceRoute />
              </SubspaceProvider>
            }
          />
          <Route path="explore/*" element={<Redirect to={routes.Contribute} />} />
        </Route>
      </Routes>
    </StorageConfigContextProvider>
  );
};

export default SubspaceRoute;
