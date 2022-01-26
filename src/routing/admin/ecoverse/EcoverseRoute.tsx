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

interface EcoverseAdminRouteProps extends PageProps {}

export const EcoverseRoute: FC<EcoverseAdminRouteProps> = ({ paths }) => {
  useTransactionScope({ type: 'admin' });
  const { ecoverseId, ecoverseNameId, ecoverse, loading: loadingEcoverse } = useEcoverse();
  const { pathname: url } = useResolvedPath('.');

  const currentPaths = useMemo(
    () => [...paths, { value: url, name: ecoverse?.displayName || '', real: true }],
    [paths, ecoverse]
  );

  return (
    <Routes>
      <Route path={'/'}>
        <Route
          index
          element={
            <ManagementPageTemplatePage
              data={managementData.ecoverseLvl}
              paths={currentPaths}
              title={ecoverse?.displayName}
              entityUrl={buildEcoverseUrl(ecoverseNameId)}
              loading={loadingEcoverse}
            />
          }
        />
        <Route path={'edit'} element={<EditEcoverse paths={currentPaths} />} />
        <Route
          path={'community/*'}
          element={
            <CommunityRoute
              paths={currentPaths}
              communityId={ecoverse?.community?.id}
              credential={AuthorizationCredential.EcoverseMember}
              resourceId={ecoverseId}
              accessedFrom="hub"
            />
          }
        />
        <Route path={'challenges/*'} element={<ChallengesRoute paths={currentPaths} />} />
        <Route
          path={'authorization/*'}
          element={<EcoverseAuthorizationRoute paths={currentPaths} resourceId={ecoverseId} />}
        />
        <Route path="*" element={<Error404 />} />
      </Route>
    </Routes>
  );
};
