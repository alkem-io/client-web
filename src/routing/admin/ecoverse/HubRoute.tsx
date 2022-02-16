import React, { FC, useMemo } from 'react';
import { Route, Routes, useResolvedPath } from 'react-router-dom';
import { managementData } from '../../../components/Admin/managementData';
import { useEcoverse, useTransactionScope } from '../../../hooks';
import { AuthorizationCredential } from '../../../models/graphql-schema';
import { Error404, PageProps } from '../../../pages';
import EditEcoverse from '../../../pages/Admin/Ecoverse/EditEcoverse';
import ManagementPageTemplatePage from '../../../pages/Admin/ManagementPageTemplatePage';
import { buildEcoverseUrl } from '../../../utils/urlBuilders';
import { ChallengesRoute } from '../challenge/ChallengesRoute';
import { CommunityRoute } from '../community';
import EcoverseAuthorizationRoute from './EcoverseAuthorizationRoute';
import EcoverseVisualsPage from '../../../pages/Admin/Ecoverse/EcoverseVisualsPage';

interface EcoverseAdminRouteProps extends PageProps {}

export const EcoverseRoute: FC<EcoverseAdminRouteProps> = ({ paths }) => {
  useTransactionScope({ type: 'admin' });
  const { hubId, hubNameId, hub, loading: loadingEcoverse } = useEcoverse();
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
              entityUrl={buildEcoverseUrl(hubNameId)}
              loading={loadingEcoverse}
            />
          }
        />
        <Route path={'edit'} element={<EditEcoverse paths={currentPaths} />} />
        <Route path={'visuals'} element={<EcoverseVisualsPage paths={currentPaths} />} />
        <Route
          path={'community/*'}
          element={
            <CommunityRoute
              paths={currentPaths}
              communityId={hub?.community?.id}
              credential={AuthorizationCredential.EcoverseMember}
              resourceId={hubId}
              accessedFrom="hub"
            />
          }
        />
        <Route path={'challenges/*'} element={<ChallengesRoute paths={currentPaths} />} />
        <Route
          path={'authorization/*'}
          element={<EcoverseAuthorizationRoute paths={currentPaths} resourceId={hubId} />}
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};
