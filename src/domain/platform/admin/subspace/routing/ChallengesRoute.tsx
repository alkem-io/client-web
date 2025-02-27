import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import { nameOfUrl } from '@/main/routing/urlParams';
import SubspaceProvider from '@/domain/journey/subspace/context/SubspaceProvider';
import SubspaceListPage from '@/domain/journey/space/pages/SpaceSubspaces/SubspaceListPage';
import { ChallengeRoute } from '@/domain/journey/settings/routes/ChallengeRoute';

const ChallengesRoute = () => {
  return (
    <Routes>
      <Route index element={<SubspaceListPage routePrefix="../" />} />
      <Route
        path={`:${nameOfUrl.subspaceNameId}/*`}
        element={
          <SubspaceProvider>
            <ChallengeRoute />
          </SubspaceProvider>
        }
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default ChallengesRoute;
