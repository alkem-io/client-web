import React, { FC, useMemo } from 'react';
import { Navigate, Route, Routes, useResolvedPath } from 'react-router-dom';
import { ChallengeProvider } from '../../context/ChallengeProvider';
import { CommunityContextProvider } from '../../domain/community/CommunityContext';
import { useHub } from '../../hooks';
import { ApplicationTypeEnum } from '../../models/enums/application-type';
import ApplyRoute from '../application/apply.route';
import { nameOfUrl } from '../url-params';
import ChallengeRoute from '../challenge/ChallengeRoute';
import { Error404, PageProps } from '../../pages';
import HubDashboardPage from '../../pages/Hub/HubDashboardPage';
import HubContextPage from '../../pages/Hub/HubContextPage';
import HubChallengesPage from '../../pages/Hub/HubChallengesPage';
import ContributePage from '../../pages/Contribute/ContributePage';
import AspectRoute from '../aspect/AspectRoute';
import AspectProvider from '../../context/aspect/AspectProvider';
import { routes } from '../../domain/hub/routes/hubRoutes';
import { EntityPageLayoutHolder } from '../../domain/shared/layout/PageLayout';

export const HubRoute: FC<PageProps> = ({ paths: _paths }) => {
  const { displayName } = useHub();
  const resolved = useResolvedPath('.');
  const currentPaths = useMemo(
    () => (displayName ? [..._paths, { value: resolved.pathname, name: displayName, real: true }] : _paths),
    [_paths, displayName, resolved]
  );

  return (
    <Routes>
      <Route path={'/'} element={<EntityPageLayoutHolder />}>
        <Route index element={<Navigate replace to={'dashboard'} />} />
        <Route path={routes.Dashboard} element={<HubDashboardPage />} />
        <Route path={routes.Explore} element={<ContributePage entityTypeName="hub" />} />
        <Route path={`${routes.Explore}/:canvasId`} element={<ContributePage entityTypeName="hub" />} />
        <Route path={routes.About} element={<HubContextPage paths={currentPaths} />} />
        <Route path={routes.Challenges} element={<HubChallengesPage paths={currentPaths} />} />
      </Route>
      <Route path={'apply'} element={<ApplyRoute paths={currentPaths} type={ApplicationTypeEnum.hub} />} />
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
      <Route
        path={`contribute/aspects/:${nameOfUrl.aspectNameId}/*`}
        element={
          <AspectProvider>
            <AspectRoute paths={currentPaths} />
          </AspectProvider>
        }
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
