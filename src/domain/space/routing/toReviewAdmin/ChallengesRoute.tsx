import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import { nameOfUrl } from '@/main/routing/urlParams';
import SubspaceContextProvider from '@/domain/space/context/SubspaceContext';
import SubspaceListPage from '@/domain/space/layout/tabbedLayout/Tabs/SpaceSubspaces/SubspaceListPage';
import { ChallengeRoute } from '@/domain/space/routing/toReview2/ChallengeRoute';

const ChallengesRoute = () => {
  return (
    <Routes>
      <Route index element={<SubspaceListPage routePrefix="../" />} />
      <Route
        path={`:${nameOfUrl.subspaceNameId}/*`}
        element={
          <SubspaceContextProvider>
            <ChallengeRoute />
          </SubspaceContextProvider>
        }
      />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default ChallengesRoute;
