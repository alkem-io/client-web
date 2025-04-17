import React, { useMemo } from 'react';
import { Route, Routes } from 'react-router';
import { Outlet, Navigate } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import { nameOfUrl } from '@/main/routing/urlParams';
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
import { SubspacePageLayout } from '../layout/SubspacePageLayout';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

const SubspaceRoute = ({ level = SpaceLevel.L1 }: { level?: SpaceLevel }) => {
  const { subspace, permissions, loading } = useSubSpace();

  const { canRead, spaceId } = useMemo(() => {
    return {
      canRead: permissions.canRead,
      spaceId: subspace.id,
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
    <StorageConfigContextProvider locationType="journey" spaceId={spaceId}>
      <Routes>
        <Route element={level === SpaceLevel.L2 ? <Outlet /> : <SubspacePageLayout level={level} />}>
          {/* legacy routes */}
          <Route path="explore/*" element={<Redirect to={EntityPageSection.Contribute} />} />
          <Route path={EntityPageSection.Dashboard} element={<Navigate replace to="/" />} />
          {/* current routes */}
          {/* <Route index element={<SubspaceHomePage />} /> */}
          <Route path={SubspaceDialog.About} element={<SubspaceAboutPage />} />
          <Route path={`${SubspaceDialog.Settings}/*`} element={<SubspaceSettingsRoute />} />
          {/* <Route path={SubspaceDialog.Updates} element={<SubspaceHomePage dialog={SubspaceDialog.Updates} />} /> */}
          <Route
            path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}`}
            element={<SubspaceCalloutPage />}
          />
          <Route
            path={`${EntityPageSection.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
            element={<SubspaceCalloutPage>{props => <CalloutRoute {...props} />}</SubspaceCalloutPage>}
          />
          <Route index path={`:dialog?/:${nameOfUrl.calendarEventNameId}?`} element={<SubspaceHomePage />} />
          {/* l2 spaces are recursive */}
          <Route
            path={`opportunities/:${nameOfUrl.subsubspaceNameId}/:dialog?/:${nameOfUrl.calendarEventNameId}?`}
            element={<SubspaceRoute level={SpaceLevel.L2} />}
          />
          <Route
            path="*"
            element={
              <NotFoundPageLayout>
                <Error404 />
              </NotFoundPageLayout>
            }
          />
        </Route>
      </Routes>
    </StorageConfigContextProvider>
  );
};

export default SubspaceRoute;
