import React, { FC, useMemo } from 'react';
import { Navigate, Route, Routes, useResolvedPath } from 'react-router-dom';
import { ChallengeProvider } from '../../context/ChallengeProvider';
import { CommunityProvider } from '../../context/CommunityProvider';
import { useHub } from '../../hooks';
import { ApplicationTypeEnum } from '../../models/enums/application-type';
import { Error404, PageProps } from '../../pages';
import HubDashboardPage from '../../pages/Hub/HubDashboardPage';
import ApplyRoute from '../application/apply.route';
import { nameOfUrl } from '../url-params';
import HubTabs from './HubTabs';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';
import HubPageContainer from '../../containers/hub/HubPageContainer';
import HubCommunityPage from '../../pages/Community/HubCommunityPage';
import DiscussionsRoute from '../discussions/DiscussionsRoute';
import RestrictedRoute, { CredentialForResource } from '../RestrictedRoute';
import { AuthorizationCredential } from '../../models/graphql-schema';
import ChallengeRoute from '../challenge/ChallengeRoute';
import HubContextPage from '../../pages/Hub/HubContextPage';
import HubCanvasPage from './HubCanvasPage';
import HubChallengesPage from '../../pages/Hub/HubChallengesPage';
import AspectRoute from '../aspect/AspectRoute';
import AspectProvider from '../../context/aspect/AspectProvider';

export const HubRoute: FC<PageProps> = ({ paths: _paths }) => {
  const {
    hub,
    displayName,
    isPrivate,
    hubId,
    permissions: { canReadAspects },
  } = useHub();
  const resolved = useResolvedPath('.');
  const currentPaths = useMemo(
    () => (hub ? [..._paths, { value: resolved.pathname, name: displayName, real: true }] : _paths),
    [_paths, displayName, resolved]
  );
  const discussionsRequiredCredentials: CredentialForResource[] =
    isPrivate && hubId ? [{ credential: AuthorizationCredential.HubMember, resourceId: hubId }] : [];

  return (
    <DiscussionsProvider>
      <HubPageContainer>
        {(e, s) => (
          <Routes>
            <Route
              path={'/'}
              element={
                <HubTabs
                  challengesReadAccess={e.permissions.challengesReadAccess}
                  communityReadAccess={e.permissions.communityReadAccess}
                />
              }
            >
              <Route index element={<Navigate replace to={'dashboard'} />} />
              <Route path={'dashboard'} element={<HubDashboardPage paths={currentPaths} />} />
              <Route path={'context'} element={<HubContextPage paths={currentPaths} />} />
              <Route path={'community'} element={<HubCommunityPage paths={currentPaths} />} />
              <Route
                path={'discussions/*'}
                element={
                  <RestrictedRoute requiredCredentials={discussionsRequiredCredentials}>
                    <DiscussionsRoute paths={currentPaths} />
                  </RestrictedRoute>
                }
              />
              <Route path={'canvases'} element={<HubCanvasPage paths={currentPaths} entities={e} state={s} />} />
              <Route path={'challenges'} element={<HubChallengesPage paths={currentPaths} entities={e} state={s} />} />
            </Route>
            <Route path={'apply'} element={<ApplyRoute paths={currentPaths} type={ApplicationTypeEnum.hub} />} />
            <Route
              path={`challenges/:${nameOfUrl.challengeNameId}/*`}
              element={
                <ChallengeProvider>
                  <CommunityProvider>
                    <ChallengeRoute paths={currentPaths} />
                  </CommunityProvider>
                </ChallengeProvider>
              }
            />
            {canReadAspects && (
              <Route
                path={`aspects/:${nameOfUrl.aspectNameId}/*`}
                element={
                  <AspectProvider>
                    <AspectRoute paths={currentPaths} />
                  </AspectProvider>
                }
              />
            )}
            <Route path="*" element={<Error404 />} />
          </Routes>
        )}
      </HubPageContainer>
    </DiscussionsProvider>
  );
};
