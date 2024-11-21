import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '@/core/pages/Errors/Error404';
import SubspaceAuthorizationPage from '@/domain/journey/subspace/pages/SubspaceAuthorization/SubspaceAuthorizationPage';

const ChallengeAuthorizationRoute: FC = () => {
  return (
    <Routes>
      <Route index element={<SubspaceAuthorizationPage routePrefix="../../" />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default ChallengeAuthorizationRoute;
