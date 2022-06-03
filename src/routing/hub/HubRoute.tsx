import React, { FC, useMemo } from 'react';
import { Navigate, Route, Routes, useResolvedPath } from 'react-router-dom';
import { ChallengeProvider } from '../../context/ChallengeProvider';
import { CommunityContextProviderGlobal } from '../../domain/community/CommunityContext';
import { useHub } from '../../hooks';
import { ApplicationTypeEnum } from '../../models/enums/application-type';
import ApplyRoute from '../application/apply.route';
import { nameOfUrl } from '../url-params';
import HubTabs from './HubTabs';
import DiscussionsRoute from '../discussions/DiscussionsRoute';
import RestrictedRoute, { CredentialForResource } from '../RestrictedRoute';
import { AuthorizationCredential } from '../../models/graphql-schema';
import ChallengeRoute from '../challenge/ChallengeRoute';
import HubCommunityPage from '../../pages/Community/HubCommunityPage';
import { Error404, PageProps } from '../../pages';
import HubDashboardPage from '../../pages/Hub/HubDashboardPage';
import HubContextPage from '../../pages/Hub/HubContextPage';
import HubChallengesPage from '../../pages/Hub/HubChallengesPage';
import ContributePage from '../../pages/Contribute/ContributePage';
import HubCanvasPage from './HubCanvasPage';
import AspectRoute from '../aspect/AspectRoute';
import AspectProvider from '../../context/aspect/AspectProvider';

export const HubRoute: FC<PageProps> = ({ paths: _paths }) => {
  const { displayName, isPrivate, hubId, hubNameId, permissions } = useHub();
  const resolved = useResolvedPath('.');
  const currentPaths = useMemo(
    () => (displayName ? [..._paths, { value: resolved.pathname, name: displayName, real: true }] : _paths),
    [_paths, displayName, resolved]
  );
  const discussionsRequiredCredentials: CredentialForResource[] =
    isPrivate && hubId ? [{ credential: AuthorizationCredential.HubMember, resourceId: hubId }] : [];

  return (
    <Routes>
      <Route path={'/'} element={<HubTabs hubNameId={hubNameId} permissions={permissions} />}>
        <Route index element={<Navigate replace to={'dashboard'} />} />
        <Route path={'dashboard'} element={<HubDashboardPage paths={currentPaths} />} />
        <Route path={'contribute'} element={<ContributePage entityTypeName="hub" paths={currentPaths} />} />
        <Route path={'context'} element={<HubContextPage paths={currentPaths} />} />
        <Route path={'community'} element={<HubCommunityPage paths={currentPaths} />} />
        <Route
          path={'discussions/*'}
          element={
            <RestrictedRoute requiredCredentials={discussionsRequiredCredentials}>
              <DiscussionsRoute entityTypeName="hub" paths={currentPaths} />
            </RestrictedRoute>
          }
        />
        <Route path={'canvases'} element={<HubCanvasPage paths={currentPaths} />} />
        <Route path={'challenges'} element={<HubChallengesPage paths={currentPaths} />} />
      </Route>
      <Route path={'apply'} element={<ApplyRoute paths={currentPaths} type={ApplicationTypeEnum.hub} />} />
      <Route
        path={`challenges/:${nameOfUrl.challengeNameId}/*`}
        element={
          <ChallengeProvider>
            <CommunityContextProviderGlobal>
              <ChallengeRoute paths={currentPaths} />
            </CommunityContextProviderGlobal>
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
