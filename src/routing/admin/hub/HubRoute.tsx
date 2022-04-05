import React, { FC, useMemo } from 'react';
import { Navigate, Route, Routes, useResolvedPath } from 'react-router-dom';
import { useHub, useTransactionScope } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { Error404, PageProps } from '../../../pages';
import { ChallengesRoute } from '../challenge/ChallengesRoute';
import { CommunityRoute } from '../community';
import HubAuthorizationRoute from './HubAuthorizationRoute';
import HubProfilePage from '../../../pages/Admin/Hub/HubProfile/HubProfilePage';
import HubContextPage from '../../../pages/Admin/Hub/HubContext/HubContextPage';
import HubCommunicationsPage from '../../../pages/Admin/Hub/HubCommunication/HubCommunicationsPage';
import HubCommunityPage from '../../../pages/Admin/Hub/HubCommunity/HubCommunityPage';

interface HubAdminRouteProps extends PageProps {}

export const HubRoute: FC<HubAdminRouteProps> = ({ paths }) => {
  useTransactionScope({ type: 'admin' });
  const { hubId, displayName, communityId } = useHub();
  const { pathname: url } = useResolvedPath('.');

  const currentPaths = useMemo(() => [...paths, { value: url, name: displayName, real: true }], [paths, displayName]);

  return (
    <Routes>
      <Route index element={<Navigate to="profile" replace />} />
      <Route path="profile" element={<HubProfilePage paths={currentPaths} />} />
      <Route path="context" element={<HubContextPage paths={currentPaths} />} />
      <Route path="communications" element={<HubCommunicationsPage communityId={communityId} paths={currentPaths} />} />
      <Route path="community" element={<HubCommunityPage paths={currentPaths} />} />
      <Route
        path="community/*"
        element={
          <CommunityRoute
            paths={currentPaths}
            communityId={communityId}
            credential={AuthorizationCredential.HubMember}
            resourceId={hubId}
            accessedFrom="hub"
          />
        }
      />
      <Route path="challenges/*" element={<ChallengesRoute paths={currentPaths} />} />
      <Route path="authorization/*" element={<HubAuthorizationRoute paths={currentPaths} resourceId={hubId} />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
