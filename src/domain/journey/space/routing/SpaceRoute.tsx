import React, { FC, useMemo } from 'react';
import { Navigate, Route, Routes, useResolvedPath } from 'react-router-dom';
import { ChallengeProvider } from '../../challenge/context/ChallengeProvider';
import { CommunityContextProvider } from '../../../community/community/CommunityContext';
import { useSpace } from '../SpaceContext/useSpace';
import { ApplicationTypeEnum } from '../../../community/application/constants/ApplicationType';
import ApplyRoute from '../../../community/application/routing/ApplyRoute';
import { nameOfUrl } from '../../../../main/routing/urlParams';
import ChallengeRoute from '../../challenge/routing/ChallengeRoute';
import { PageProps } from '../../../shared/types/PageProps';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import SpaceChallengesPage from '../pages/SpaceChallengesPage';
import { routes } from '../routes/spaceRoutes';
import { EntityPageLayoutHolder } from '../../common/EntityPageLayout';
import CalloutRoute from '../../../collaboration/callout/routing/CalloutRoute';
import SpaceDashboardPage from '../SpaceDashboard/SpaceDashboardPage';
import SpacePageLayout from '../layout/SpacePageLayout';
import Redirect from '../../../../core/routing/Redirect';
import SpaceSearchPage from '../pages/SpaceSearchPage';
import SpaceCalloutPage from '../spaceCalloutPage/SpaceCalloutPage';
import SpaceCommunityPage from '../SpaceCommunityPage/SpaceCommunityPage';
import KnowledgeBasePage from '../../../collaboration/KnowledgeBase/KnowedgeBasePage';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';

export const SpaceRoute: FC<PageProps> = ({ paths: _paths }) => {
  const {
    spaceNameId,
    profile: { displayName },
  } = useSpace();
  const resolved = useResolvedPath('.');
  const currentPaths = useMemo(
    () => (displayName ? [..._paths, { value: resolved.pathname, name: displayName, real: true }] : _paths),
    [_paths, displayName, resolved]
  );

  return (
    <StorageConfigContextProvider locationType="journey" journeyTypeName="space" spaceNameId={spaceNameId}>
      <Routes>
        <Route path="/" element={<EntityPageLayoutHolder />}>
          <Route index element={<Navigate replace to={routes.Dashboard} />} />
          <Route path={routes.Dashboard} element={<SpaceDashboardPage />} />
          <Route path={`${routes.Dashboard}/updates`} element={<SpaceDashboardPage dialog="updates" />} />
          <Route path={`${routes.Dashboard}/contributors`} element={<SpaceDashboardPage dialog="contributors" />} />
          <Route path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}`} element={<SpaceCalloutPage />} />
          <Route
            path={`${routes.Collaboration}/:${nameOfUrl.calloutNameId}/*`}
            element={<SpaceCalloutPage>{props => <CalloutRoute {...props} />}</SpaceCalloutPage>}
          />
          <Route path={`${routes.Dashboard}/calendar`} element={<SpaceDashboardPage dialog="calendar" />} />
          <Route
            path={`${routes.Dashboard}/calendar/:${nameOfUrl.calendarEventNameId}`}
            element={<SpaceDashboardPage dialog="calendar" />}
          />
          <Route path={routes.Community} element={<SpaceCommunityPage />} />
          <Route path={routes.About} element={<SpaceDashboardPage dialog="about" />} />
          <Route path={routes.Challenges} element={<SpaceChallengesPage />} />
          <Route path={routes.KnowledgeBase} element={<KnowledgeBasePage journeyTypeName="space" />} />
          <Route path={routes.Search} element={<SpaceSearchPage />} />
        </Route>
        <Route
          path="apply"
          element={
            <ApplyRoute
              paths={currentPaths}
              type={ApplicationTypeEnum.space}
              journeyPageLayoutComponent={SpacePageLayout}
            />
          }
        />
        <Route
          path={`challenges/:${nameOfUrl.challengeNameId}/*`}
          element={
            <ChallengeProvider>
              <CommunityContextProvider>
                <ChallengeRoute paths={currentPaths} />
              </CommunityContextProvider>
            </ChallengeProvider>
          }
        />
        <Route path="explore/*" element={<Redirect to={routes.Contribute} />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </StorageConfigContextProvider>
  );
};
