import React, { useMemo } from 'react';
import { Route, Routes } from 'react-router';
import { Navigate } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import { nameOfUrl } from '@/main/routing/urlParams';
import SubspaceContextProvider from '../context/SubspaceContext';
import { NotFoundPageLayout } from '@/domain/space/layout/EntityPageLayout';
import CalloutRoute from '@/domain/collaboration/callout/routing/CalloutRoute';
import SubspaceAboutPage from '../about/SubspaceAboutPage';
import SubspaceHomePage from '../layout/flowLayout/SubspaceHomePage';
import Redirect from '@/core/routing/Redirect';
import { StorageConfigContextProvider } from '@/domain/storage/StorageBucket/StorageConfigContext';
import SubspaceCalloutPage from '../pages/SubspaceCalloutPage';
import { SubspaceDialog } from '../components/subspaces/SubspaceDialog';
import SubspaceSettingsRoute from './SubspaceSettingsRoute';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';

const LegacyRoutesRedirects = () => (
  <>
    <Route path="explore/*" element={<Redirect to={EntityPageSection.Contribute} />} />
  </>
);

const SubspaceRoute = () => {
  const { subspace, permissions, loading } = useSubSpace();

  const { canRead, spaceId, spacePath } = useMemo(() => {
    let spacePath: string = '';
    try {
      spacePath = new URL(subspace.about.profile.url).pathname;
    } catch {}

    return {
      canRead: permissions.canRead,
      spaceId: subspace.id,
      spacePath,
    };
  }, [subspace, permissions]);

  if (spaceId && !loading && !canRead) {
    return (
      <Routes>
        <Route path={EntityPageSection.About} element={<SubspaceAboutPage />} />
        <Route path="*" element={<Navigate to={EntityPageSection.About} replace />} />
      </Routes>
    );
  }

  return (
    <StorageConfigContextProvider locationType="space" spaceId={spaceId}>
      <Routes>
        <Route index element={<SubspaceHomePage />} />
        <Route path={SubspaceDialog.Index} element={<SubspaceHomePage dialog={SubspaceDialog.Index} />} />
        <Route path={SubspaceDialog.Outline} element={<SubspaceHomePage dialog={SubspaceDialog.Outline} />} />
        <Route path={SubspaceDialog.Subspaces} element={<SubspaceHomePage dialog={SubspaceDialog.Subspaces} />} />
        <Route path={SubspaceDialog.Contributors} element={<SubspaceHomePage dialog={SubspaceDialog.Contributors} />} />
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
        <Route path={EntityPageSection.Dashboard} element={<Navigate replace to={spacePath} />} />
        <Route
          path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}`}
          element={<SubspaceCalloutPage />}
        />
        <Route
          path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
          element={<SubspaceCalloutPage>{props => <CalloutRoute {...props} />}</SubspaceCalloutPage>}
        />
        <Route path={`${SubspaceDialog.Settings}/*`} element={<SubspaceSettingsRoute />} />
        <Route
          path={`opportunities/:${nameOfUrl.subsubspaceNameId}/*`}
          element={
            <SubspaceContextProvider>
              <SubspaceRoute />
            </SubspaceContextProvider>
          }
        />
        {LegacyRoutesRedirects()}
        <Route
          path="*"
          element={
            <NotFoundPageLayout>
              <Error404 />
            </NotFoundPageLayout>
          }
        />
      </Routes>
    </StorageConfigContextProvider>
  );
};

export default SubspaceRoute;
