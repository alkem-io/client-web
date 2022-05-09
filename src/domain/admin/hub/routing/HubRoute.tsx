import React, { FC, useMemo } from 'react';
import { Navigate, Route, Routes, useResolvedPath } from 'react-router-dom';
import { useTransactionScope, useHub } from '../../../../hooks';
import { PageProps, Error404 } from '../../../../pages';
import HubCommunicationsPage from '../../../hub/pages/HubCommunication/HubCommunicationsPage';
import HubContextPage from '../../../hub/pages/HubContextPage';
import HubProfilePage from '../../../hub/pages/HubProfile/HubProfilePage';
import { ChallengesRoute } from '../../challenge/routing/ChallengesRoute';
import { ApplicationsAdminRoutes } from '../../community/routes/ApplicationsAdminRoutes';
import HubCommunityAdminPage from '../HubCommunityAdminPage';
import HubTemplatesAdminRoutes from '../HubTemplatesAdminRoutes';
import HubAuthorizationRoute from './HubAuthorizationRoute';
import CommunityGroupsRoute from '../../community/routes/CommunityGroupsAdminRoutes';

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
      <Route path="community" element={<HubCommunityAdminPage paths={currentPaths} />} />
      <Route path="templates/*" element={<HubTemplatesAdminRoutes hubId={hubId} paths={currentPaths} />} />
      <Route
        path="community/groups/*"
        element={<CommunityGroupsRoute paths={currentPaths} communityId={communityId} />}
      />
      <Route path="community/applications/*" element={<ApplicationsAdminRoutes />} />
      <Route path="challenges/*" element={<ChallengesRoute paths={currentPaths} />} />
      <Route path="authorization/*" element={<HubAuthorizationRoute paths={currentPaths} resourceId={hubId} />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};
