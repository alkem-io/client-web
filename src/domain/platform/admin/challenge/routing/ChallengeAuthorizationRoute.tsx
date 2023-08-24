import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Error404 } from '../../../../../core/pages/Errors/Error404';
import ChallengeAuthorizationPage from '../../../../journey/challenge/pages/ChallengeAuthorization/ChallengeAuthorizationPage';

const ChallengeAuthorizationRoute: FC = () => {
  return (
    <Routes>
      <Route index element={<ChallengeAuthorizationPage routePrefix="../../" />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default ChallengeAuthorizationRoute;
