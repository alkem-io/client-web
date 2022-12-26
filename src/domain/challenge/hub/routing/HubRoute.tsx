import React, { FC, useMemo } from 'react';
import { Navigate, Route, Routes, useLocation, useResolvedPath } from 'react-router-dom';
import { ChallengeProvider } from '../../challenge/context/ChallengeProvider';
import { CommunityContextProvider } from '../../../community/community/CommunityContext';
import { useHub } from '../HubContext/useHub';
import { ApplicationTypeEnum } from '../../../community/application/constants/ApplicationType';
import ApplyRoute from '../../../community/application/routing/ApplyRoute';
import { nameOfUrl } from '../../../../core/routing/urlParams';
import ChallengeRoute from '../../challenge/routing/ChallengeRoute';
import { PageProps } from '../../../shared/types/PageProps';
import { Error404 } from '../../../../core/pages/Errors/Error404';
import HubChallengesPage from '../pages/HubChallengesPage';
import { routes } from '../routes/hubRoutes';
import { EntityPageLayoutHolder } from '../../common/EntityPageLayout';
import CalloutRoute from '../../../collaboration/callout/routing/CalloutRoute';
import HubAboutPage from '../pages/HubAboutPage';
import HubDashboardPage from '../pages/HubDashboardPage';
import ContributePage from '../../../collaboration/contribute/ContributePage';
import HubPageLayout from '../layout/HubPageLayout';
import { useUrlParams } from '../../../../core/routing/useUrlParams';

export const HubRoute: FC<PageProps> = ({ paths: _paths }) => {
  const { displayName } = useHub();
  const resolved = useResolvedPath('.');
  const currentPaths = useMemo(
    () => (displayName ? [..._paths, { value: resolved.pathname, name: displayName, real: true }] : _paths),
    [_paths, displayName, resolved]
  );
  const { hubNameId = '' } = useUrlParams();
  const location = useLocation();

  return (
    <Routes>
      <Route path="/" element={<EntityPageLayoutHolder />}>
        <Route index element={<Navigate replace to={routes.Dashboard} />} />
        <Route path={routes.Dashboard} element={<HubDashboardPage />} />
        <Route path={`${routes.Dashboard}/updates`} element={<HubDashboardPage dialog="updates" />} />
        <Route path={`${routes.Dashboard}/contributors`} element={<HubDashboardPage dialog="contributors" />} />
        <Route path={routes.Contribute} element={<ContributePage entityTypeName="hub" />} />
        <Route path={routes.About} element={<HubAboutPage />} />
        <Route path={routes.Challenges} element={<HubChallengesPage />} />

        <Route
          path={`${routes.Contribute}/callouts/:${nameOfUrl.calloutNameId}`}
          element={<ContributePage entityTypeName="hub" scrollToCallout />}
        />
        <Route
          path={`${routes.Contribute}/callouts/:${nameOfUrl.calloutNameId}/*`}
          element={<CalloutRoute parentPagePath={`${resolved.pathname}/${routes.Contribute}`} entityTypeName="hub" />}
        />
      </Route>
      <Route
        path="apply"
        element={<ApplyRoute paths={currentPaths} type={ApplicationTypeEnum.hub} entityPageLayout={HubPageLayout} />}
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
      <Route path="*" element={<Error404 />} />
      {/* Legacy routes */}
      <Route path={routes.Explore} element={<Navigate replace to={`/${hubNameId}/${routes.Contribute}`} />} />
      <Route
        path={`${routes.Explore}/callouts/:${nameOfUrl.calloutNameId}`}
        element={<Navigate replace to={`${location.pathname.replace(routes.Explore, routes.Contribute)}`} />}
      />
      <Route
        path={`${routes.Explore}/callouts/:${nameOfUrl.calloutNameId}/*`}
        element={<Navigate replace to={`${location.pathname.replace(routes.Explore, routes.Contribute)}`} />}
      />
    </Routes>
  );
};
