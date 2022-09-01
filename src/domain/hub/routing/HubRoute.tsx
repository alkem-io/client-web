import React, { FC, useMemo } from 'react';
import { Navigate, Route, Routes, useResolvedPath } from 'react-router-dom';
import { ChallengeProvider } from '../../challenge/context/ChallengeProvider';
import { CommunityContextProvider } from '../../community/CommunityContext';
import { useHub } from '../../../hooks';
import { ApplicationTypeEnum } from '../../../models/enums/application-type';
import ApplyRoute from '../../application/routing/apply.route';
import { nameOfUrl } from '../../../routing/url-params';
import ChallengeRoute from '../../challenge/routing/ChallengeRoute';
import { Error404, PageProps } from '../../../pages';
import HubChallengesPage from '../pages/HubChallengesPage';
import { routes } from '../routes/hubRoutes';
import { EntityPageLayoutHolder } from '../../shared/layout/PageLayout';
import CalloutsPage from '../../callout/CalloutsPage';
import CalloutRoute from '../../callout/routing/CalloutRoute';
import HubContextPage from '../pages/HubContextPage';
import HubDashboardPage from '../pages/HubDashboardPage';

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
        <Route path={`${routes.Dashboard}/updates`} element={<HubDashboardPage dialog="updates" />} />
        <Route path={`${routes.Dashboard}/contributors`} element={<HubDashboardPage dialog="contributors" />} />
        <Route
          path={routes.Explore}
          element={<CalloutsPage entityTypeName="hub" rootUrl={`${resolved.pathname}/${routes.Explore}`} />}
        />
        <Route path={routes.About} element={<HubContextPage paths={currentPaths} />} />
        <Route path={routes.Challenges} element={<HubChallengesPage paths={currentPaths} />} />

        <Route
          path={`${routes.Explore}/callouts/:${nameOfUrl.calloutNameId}`}
          element={<Navigate replace to={`${resolved.pathname}/${routes.Explore}`} />}
        />
        <Route
          path={`${routes.Explore}/callouts/:${nameOfUrl.calloutNameId}/*`}
          element={<CalloutRoute parentPagePath={`${resolved.pathname}/${routes.Explore}`} entityTypeName={'hub'} />}
        />
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
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
