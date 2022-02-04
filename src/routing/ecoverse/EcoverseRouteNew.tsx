import React, { FC, useMemo } from 'react';
import { Navigate, Route, Routes, useResolvedPath } from 'react-router-dom';
import { ChallengeProvider } from '../../context/ChallengeProvider';
import { CommunityProvider } from '../../context/CommunityProvider';
import { useEcoverse } from '../../hooks';
import { ApplicationTypeEnum } from '../../models/enums/application-type';
import { Error404, PageProps } from '../../pages';
import EcoverseDashboardPage from '../../pages/Ecoverse/EcoverseDashboardPage';
import ApplyRoute from '../application/apply.route';
import { nameOfUrl } from '../url-params';
import EcoverseTabsNew from './EcoverseTabsNew';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';
import EcoversePageContainer from '../../containers/ecoverse/EcoversePageContainer';
import EcoverseCommunityPage from '../../pages/Community/EcoverseCommunityPage';
import DiscussionsRoute from '../discussions/DiscussionsRoute';
import RestrictedRoute, { CredentialForResource } from '../RestrictedRoute';
import { AuthorizationCredential } from '../../models/graphql-schema';
import ChallengeRouteNew from '../challenge/ChallengeRouteNew';
import EcoverseContextPage from '../../pages/Ecoverse/EcoverseContextPage';
import HubCanvasPage from './HubCanvasPage';
import HubChallengesPage from '../../pages/Ecoverse/EcoverseChallengesPage';
import AspectRoute from '../aspect/AspectRoute';

export const EcoverseRouteNew: FC<PageProps> = ({ paths: _paths }) => {
  const { ecoverse, displayName, isPrivate, ecoverseId } = useEcoverse();
  const resolved = useResolvedPath('.');
  const currentPaths = useMemo(
    () => (ecoverse ? [..._paths, { value: resolved.pathname, name: displayName, real: true }] : _paths),
    [_paths, displayName, resolved]
  );
  const discussionsRequiredCredentials: CredentialForResource[] =
    isPrivate && ecoverseId ? [{ credential: AuthorizationCredential.EcoverseMember, resourceId: ecoverseId }] : [];

  return (
    <DiscussionsProvider>
      <EcoversePageContainer>
        {(e, s) => (
          <Routes>
            <Route
              path={'/'}
              element={
                <EcoverseTabsNew
                  challengesReadAccess={e.permissions.challengesReadAccess}
                  communityReadAccess={e.permissions.communityReadAccess}
                />
              }
            >
              <Route index element={<Navigate replace to={'dashboard'} />} />
              <Route path={'dashboard'} element={<EcoverseDashboardPage paths={currentPaths} />} />
              <Route path={'context'} element={<EcoverseContextPage paths={currentPaths} />} />
              <Route path={'community'} element={<EcoverseCommunityPage paths={currentPaths} />} />
              <Route
                path={'community/discussions/*'}
                element={
                  <RestrictedRoute requiredCredentials={discussionsRequiredCredentials}>
                    <DiscussionsRoute paths={currentPaths} />
                  </RestrictedRoute>
                }
              />
              <Route path={'canvases'} element={<HubCanvasPage paths={currentPaths} entities={e} state={s} />} />
              <Route path={'challenges'} element={<HubChallengesPage paths={currentPaths} entities={e} state={s} />} />
            </Route>
            <Route path={'apply'} element={<ApplyRoute paths={currentPaths} type={ApplicationTypeEnum.ecoverse} />} />
            <Route
              path={`challenges/:${nameOfUrl.challengeNameId}/*`}
              element={
                <ChallengeProvider>
                  <CommunityProvider>
                    <ChallengeRouteNew paths={currentPaths} />
                  </CommunityProvider>
                </ChallengeProvider>
              }
            />
            <Route path={`aspects/:${nameOfUrl.aspectId}/*`} element={<AspectRoute paths={currentPaths} />} />
            <Route path="*" element={<Error404 />} />
          </Routes>
        )}
      </EcoversePageContainer>
    </DiscussionsProvider>
  );
};
