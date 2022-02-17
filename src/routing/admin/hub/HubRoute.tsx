import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { managementData } from '../../../components/Admin/managementData';
import { useHub, useTransactionScope } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { Error404, PageProps } from '../../../pages';
import EditHub from '../../../pages/Admin/Hub/EditHub';
import ManagementPageTemplatePage from '../../../pages/Admin/ManagementPageTemplatePage';
import { buildHubUrl } from '../../../utils/urlBuilders';
import { ChallengesRoute } from '../challenge/ChallengesRoute';
import { CommunityRoute } from '../community';
import HubAuthorizationRoute from './HubAuthorizationRoute';
import HubVisualsPage from '../../../pages/Admin/Hub/HubVisualsPage';

interface HubAdminRouteProps extends PageProps {}

export const HubRoute: FC<HubAdminRouteProps> = ({ paths }) => {
  useTransactionScope({ type: 'admin' });
  const { hubId, hubNameId, hub, loading: loadingHub } = useHub();
  const { pathname: url } = useResolvedPath('.');

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: hub?.displayName || '', real: true }],
    [paths, hub]
  );

  return (
    <Routes>
      <Route path={'/'}>
        <Route
          index
          element={
            <ManagementPageTemplatePage
              data={managementData.hubLvl}
              paths={currentPaths}
              title={hub?.displayName}
              entityUrl={buildHubUrl(hubNameId)}
              loading={loadingHub}
            />
          }
        />
        <Route path={'edit'} element={<EditHub paths={currentPaths} />} />
        <Route path={'visuals'} element={<HubVisualsPage paths={currentPaths} />} />
        <Route
          path={'community/*'}
          element={
            <CommunityRoute
              paths={currentPaths}
              communityId={hub?.community?.id}
              credential={AuthorizationCredential.HubMember}
              resourceId={hubId}
              accessedFrom="hub"
            />
          }
        />
        <Route path={'challenges/*'} element={<ChallengesRoute paths={currentPaths} />} />
        <Route path={'authorization/*'} element={<HubAuthorizationRoute paths={currentPaths} resourceId={hubId} />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};
