import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import { nameOfUrl } from '@/main/routing/urlParams';
import SubspaceProvider from '../../../../journey/subspace/context/SubspaceProvider';
import SubspaceListPage from '../../../../journey/space/pages/SpaceSubspaces/SubspaceListPage';
import { ChallengeRoute } from '../../../../journey/settings/routes/ChallengeRoute';

export const ChallengesRoute: FC = () => {
  return (
    <Routes>
      <Route index element={<SubspaceListPage routePrefix="../../" />} />
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
